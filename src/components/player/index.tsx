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

type Project = {
	name: string;
	image: string;
	link: string;
}

const projects: Project[] = [

	{ name: "Operation: Arctic Wolf Revisited", image: "./assets/images/articwolf.png", link: "https://www.moddb.com/mods/edge-classic-add-ons/downloads/arctic-wolf-revisited" },
	{ name: "Astral Pathfinder", image: "./assets/images/astralpathfinder.png", link: "https://www.moddb.com/mods/edge-classic-add-ons/downloads/astral-pathfinder1" },
	{ name: "Aliens: Stranded", image: "./assets/images/aliensstranded.png", link: "https://www.moddb.com/mods/edge-classic-add-ons/downloads/aliens-stranded" }
]

const WadChooser = () => {

	const pelements = projects.map(p => {
		return <a href={p.link} target="_blank" style="display:flex;flex:1;flex-direction:column;height:100%;align-items:flex-end">
			<div style={{ display: "flex", flex: 0 }}>
				<div style={{ paddingTop: 12, paddingBottom: 4, fontSize: 14, whiteSpace: "pre", fontWeight: "normal" }}>{p.name}</div>
			</div>
			<div style={{ display: "flex", position: "relative", flexGrow: 1, width: "100%" }} >
				<img style="width:100%;height:100%; object-fit:cover;position:scale-down;top:0;left:0" src={p.image} />
			</div>
		</a>		
	});

	return <div style={{ display: "flex", width: "100%", maxWidth: "1440px", padding: 24, paddingLeft: 42 }}>
		<div style={{ display: "flex", flexGrow: 1 }}>
			<div style={{ display: "flex", width: "80%" }}>
				<div style={{ display: "flex", flexDirection: "column", justifyContent: "start" }}>
					<div style={{ display: "flex" }}>
						<div style={{ fontSize: 18, fontWeight: "normal", paddingBottom: 24 }}>EDGE-Classic is a Doom source port that provides advanced features, ease of modding, and attractive visuals while keeping hardware requirements very modest.
							<p>The latest release can be downloaded from <a href="https://edge-classic.github.io/index.html" target="_blank">https://edge-classic.github.io</a> </p>
							<p>Play EDGE-Classic in your browser by selecting an option below:</p>
						</div>
					</div>

					<div style={{ display: "flex", alignItems: "center" }}>
						<button style="font-size:24px;width:256px;padding:12px" onClick={() => {
							WadHandler.singleton.setWad(defaultIWad, true)
						}}>Play Freedoom</button>
					</div>
					<div style={{ paddingTop: 24 }} />
					<div style={{ display: "flex", alignItems: "center" }}>
						<button style="font-size:24px;width:256px;padding:12px" onClick={() => {
							document.getElementById('getWadFile').click()
						}}>Choose Wad</button>
					</div>

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
		<div style={{ display: "flex", flexGrow: 1, width: "50%", flexDirection: "column" }}>
			<div style={{ display: "flex", flex: "0 0 24px", position: "relative" }}>
				<div style={{ position: "absolute", fontSize: 18, fontWeight: 400, whiteSpace: "pre" }}>Suggested Projects</div>
			</div>
			<div style={{ display: "flex", flexShrink: 0, flexGrow: 1, flexDirection: "column" }}>
				{pelements}
			</div>
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

		const setCanvasSize = (c: HTMLCanvasElement, w:number, h: number) => {	
			c.style.width = `${w}px`;
			c.style.height = `${h}px`;
			c.width = w;
			c.height = h;	
		}

		// initial update
		console.log("Initial canvas", Math.ceil(canvas.offsetWidth), Math.ceil(canvas.offsetHeight));
		setCanvasSize(canvas, canvas.offsetWidth, canvas.offsetHeight);

		const canvasSync = () => {
			const c = document.querySelector('#canvas') as HTMLCanvasElement;
			const container = document.querySelector('#canvas-container') as HTMLDivElement;
			setCanvasSize(c, container.offsetWidth, container.offsetHeight);
			Module._I_WebSyncScreenSize();
		};

		const pointerLockChange = (ev) => {			
			const lock = document.querySelector('#canvas') as HTMLCanvasElement === document.pointerLockElement;		

			Module._I_WebSetFullscreen(lock);			

			if (!lock)	 {				
				Module._I_WebOpenGameMenu(1);
			}
		}

		document.addEventListener("pointerlockchange", pointerLockChange, false);

		let doSyncTimeout;
		window.addEventListener("resize", (ev) => {

			clearTimeout(doSyncTimeout);
			doSyncTimeout = setTimeout(canvasSync, 250);

		});

		canvas.addEventListener("webglcontextlost", function (e) { alert('FIXME: WebGL context lost, please reload the page'); e.preventDefault(); }, false);
		

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


	return <div id="canvas-container" style={{ display: "flex", width: "100%", position: "relative" }}>
		<canvas id="canvas" style={{ display: "block", width: "100%",  visibility: state.loading ? "hidden" : "visible" }} />		
		{!!state.loading && <div style={{position:"absolute", display:"flex", width:"100%", height: "100%", justifyContent: "center", alignItems: "center"}}>
			<div class={style.loading}>
			<span style="--i:1">L</span>
			<span style="--i:2">O</span>
			<span style="--i:3">A</span>
			<span style="--i:4">D</span>
			<span style="--i:5">I</span>
			<span style="--i:6">N</span>
			<span style="--i:7">G</span>
			<span style="--i:8">.</span>
			<span style="--i:9">.</span>
			<span style="--i:10">.</span>
		</div>
		</div>}

	</div>
}
// floating player controls, not currently used
// {!state.loading && <PlayerControls />} 

const PlayerControls = () => {
	const [fullscreen, setFullscreen] = useState(false);
	return <div className="playercontrols" style={{ display: "flex", width: "100%", padding: "24px", zIndex: 1, position: "absolute" }}>
		<div className="playercontrols" style={{ display: "flex", width: "100%" }} />
		<div className="playercontrols" style={{ display: "flex", flexShrink: 1, paddingRight: "48px" }}>
			<button style={{ opacity: 1 }} className="playercontrols" onClick={() => { Module._I_WebSetFullscreen(fullscreen ? 0 : 1, setFullscreen(!fullscreen)) }}>{fullscreen ? "Minimize" : "Maximize"}</button>
		</div>
	</div>
}

const Player = () => {

	const wadHandler = WadHandler.singleton;
	const wadState = wadHandler.wadState.value;

	return (
		<div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
			{!wadState.wadName && <WadChooser />}
			{!!wadState.wadName && <EdgeClassic />}
		</div>
	);
};

export default Player;
