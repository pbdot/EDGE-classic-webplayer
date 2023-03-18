import { Signal, signal } from '@preact/signals';
import { h } from 'preact';
import style from './style.css';
import { useEffect, useState } from 'preact/hooks';
import createEdgeModule from '../../edge-classic';

const defaultIWad = "freedoom2.wad"

type PlayerConfig = {
	indexDBName: string;
}

type WadState = {
	error?: string;
	wadName?: string;
	isIWAD?: boolean;
}

const config: PlayerConfig = {
	indexDBName: '/edge-classic'
}

class WadHandler {

	constructor(config: PlayerConfig) {
		this.config = config;
	}

	private error(message: string) {
		alert(message);
		console.error(message);
		console.trace();
	}

	setWad(wadName: string, isIWAD?: boolean) {
		this.wadState.value = { wadName: wadName, isIWAD: isIWAD };
	}

	async uploadWad(file: File) {

		let database: IDBDatabase | undefined;

		try {
			database = await this.openDatabase();
			if (!database) {
				this.error("Unable to open database")
				return;
			}
		} catch (e) {
			this.error(e);
			database?.close();
			return;
		}

		const upload = new Promise<{ wadName: string, iwad: boolean }>((resolve, reject) => {

			var reader = new FileReader();
			reader.readAsArrayBuffer(file);

			reader.onload = (e) => {

				const bits = e.target.result;
				const contents = new Uint8Array(bits as ArrayBuffer);

				const iwad = contents[0] === 73;

				const trans = database.transaction(['FILE_DATA'], 'readwrite');
				const path = `${this.config.indexDBName}/${file.name}`;
				const addReq = trans.objectStore('FILE_DATA').put({ timestamp: new Date(), mode: 33206, contents: contents }, path);

				addReq.onerror = (e) => {
					reject("Error storing wad data");
				}

				trans.oncomplete = (e) => {
					resolve({ wadName: file.name, iwad: iwad });
				}
			}

			reader.onerror = (e) => {
				reject("Error reading wad");
			}

		});

		try {
			const wad = await upload;
			database?.close();
			database = undefined;
			this.setWad(wad.wadName, wad.iwad);
		} catch (e) {
			this.error(e);
		} finally {
			database?.close();
		}

	}

	private async openDatabase() {

		return new Promise<IDBDatabase | undefined>((resolve, reject) => {

			// build pre-render guard
			if (typeof window !== 'undefined') {
				const dbrequest = window.indexedDB.open(this.config.indexDBName);

				dbrequest.onerror = (e) => {
					reject(`unable to load database ${this.config.indexDBName}`);
				}

				dbrequest.onupgradeneeded = (e) => {

					console.log("upgrade needed");

					const db = (e.target as IDBOpenDBRequest).result as IDBDatabase;
					if (!db.objectStoreNames.contains("FILE_DATA")) {
						console.log("Creating FILE_DATA object store");
						const store = db.createObjectStore("FILE_DATA", {});
						store.createIndex("timestamp", "timestamp", { unique: false });
					}
				};

				dbrequest.onsuccess = (e) => {
					console.log("db open");
					const db = (e.target as IDBOpenDBRequest).result as IDBDatabase;
					resolve(db);
				}
			}
		});
	}

	wadState: Signal<WadState> = signal({});

	config: PlayerConfig;

	static get singleton(): WadHandler {
		if (!WadHandler.instance) {
			WadHandler.instance = new WadHandler(config);
		}
		return WadHandler.instance;
	}

	private static instance?: WadHandler;
}

const WadChooser = () => {

	return <div>
		<div style="padding:64px">
			<div style="text-align:center;">
				<button style="font-size:24px;padding:12px" onClick={() => {
					WadHandler.singleton.setWad(defaultIWad, true)
				}}>Play Freedoom</button>
			</div>
			<div style="text-align:center;margin-top:24px">
				<button style="font-size:24px;padding:12px" onClick={() => document.getElementById('getWadFile').click()}>Choose Wad</button>
			</div>
			<input id="getWadFile" style="display:none" type="file" onChange={(e) => {
				const files = (e.target as any).files as File[];
				if (files.length !== 1) {
					e.preventDefault();
					alert("Please select a single wad file");
					return;
				}

				const file = files[0];
				if (!file.name.toLowerCase().endsWith(".wad")) {
					e.preventDefault();
					alert("Please select a single wad file");
					return;
				}

				const wadHandler = WadHandler.singleton;
				wadHandler.uploadWad(file);

			}} />
		</div>
	</div>
}


const EdgeClassic = () => {

	const [state, setState] = useState<{ loading: boolean }>({ loading: true });
	const wadState = WadHandler.singleton.wadState.value;


	useEffect(() => {

		const wadName = wadState.wadName!;

		const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
		if (!canvas) {
			throw "Unable to get canvas";
		}

		canvas.addEventListener("webglcontextlost", function (e) { alert('FIXME: WebGL context lost, please reload the page'); e.preventDefault(); }, false);

		console.log("Initial canvas", Math.ceil(canvas.offsetWidth), Math.ceil(canvas.offsetHeight));

		let iwad = defaultIWad;
		if (wadState.wadName !== iwad && wadState.isIWAD) {
			iwad = `edge-classic/${wadName}`;
		}

		const args = ["-home", "edge-classic", "-windowed", "-width", canvas.offsetWidth.toString(), "-height", canvas.offsetHeight.toString(), "-iwad", iwad];

		if (!wadState.isIWAD) {
			args.push("-file")
			args.push(`edge-classic/${wadName}`);
		}

		createEdgeModule({
			edgePostInit: () => {
				console.log("Post-Init!");
				setState({ ...state, loading: false });
			},
			onFullscreen: () => {
				console.log("On fullscreen");
				const elements = document.querySelectorAll(".playercontrols");
				elements?.forEach(e => {					
					(e as any).style.display = "flex";
				});
			},
			preEdgeSyncFS: () => {
			},
			postEdgeSyncFS: () => {
			},
			arguments: args,
			preInit: () => {
				console.log("Pre-Init");
			},
			preRun: [],
			postRun: [],
			print: (function () {
				return function (text) {
					text = Array.prototype.slice.call(arguments).join(' ');
					console.log(text);
				};
			})(),
			printErr: function (text) {
				text = Array.prototype.slice.call(arguments).join(' ');
				console.error(text);
			},
			canvas: canvas,
			setStatus: function (text) { console.log("status", text) },
			monitorRunDependencies: function (left) { console.log(left) },
		}).then(module => {
			globalThis.Module = module;
			module.canvas = canvas;
			canvas.addEventListener("click", async () => {
				await canvas.requestPointerLock();
			});
		});


		return () => {

		};

	}, []);


	// 56.25% 16:9
	return <div class={style.edgeclassic}>
		<div style={{ display: "flex", width: "100%", flexFlow: "column", justifyContent: "top", alignItems: "center" }}>
			<canvas id="canvas" />
		</div>
	</div>
}

const PlayerControls = () => {
	const [fullscreen, setFullscreen] = useState(false);
	return <div className="playercontrols" style={{ display:"flex", width: "100%", padding: "24px", zIndex: 1, position: "absolute" }}>
		<div className="playercontrols" style={{ display:"flex", width: "100%" }} />
		<div className="playercontrols" style={{ display:"flex", flexShrink: 1, paddingRight: "48px"}}>
			<button style={{ opacity: 1 }} className="playercontrols" onClick={() => { Module._I_WebSetFullscreen(fullscreen ? 0 : 1, setFullscreen(!fullscreen)) }}>{fullscreen ? "Exit Fullscreen" : "Fullscreen"}</button>
		</div>
	</div>
}

//<div style={{ display: "flex", width: "100%", flex: "1 0 5%" }} />

const Player = () => {

	const wadHandler = WadHandler.singleton;
	const wadState = wadHandler.wadState.value;

	return (
		<div class={style.player}>
			{!wadState.wadName && <WadChooser />}
			{!!wadState.wadName &&
				<div style={{ display: "flex", width: "100%", height: "100%", flexFlow: "column", position: "relative" }}>
					<EdgeClassic />
					<PlayerControls />
				</div>}
		</div>
	);
};

export default Player;
