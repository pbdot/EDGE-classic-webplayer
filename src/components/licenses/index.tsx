import { FunctionComponent, h } from 'preact';
import style from './style.css';

const LicenseModal: FunctionComponent<{ onClose: () => void }> = ({ onClose }) => (
    <div id="myModal" class={style.modal}>
        <div class={style.modal_content}>
            <div class={style.modal_header}>
                <span class={style.close} onClick={() => onClose()}>&times;</span>
                <h2>EDGE-Classic Licenses</h2>
            </div>
            <div class={style.modal_body}>
                <div style={{ overflowY: "scroll", overflowX: "hidden", height: "512px" }}>
                    <div style={{ fontFamily: "monospace", whiteSpace: "pre", fontSize: 11 }}>{license}</div>
                </div>
            </div>
            <div class={style.modal_footer}>
            </div>
        </div>
    </div>

);

const license = `===========================================================================================
BSD 2-Clause License
===========================================================================================

miniz library (gzip support) - Copyright (c) 2015 Wojciech Adam Koszek

===========================================================================================
BSD 3-Clause License
===========================================================================================

Blasphemer (various assets) - Copyright (c) 2021 Contributors to the Blasphemer project

FMMIDI library - Copyright (c) 2003-2006 yuno

Freedoom (various assets) - Copyright (c) 2001-2019 Contributors to the Freedoom project

YMFM library - Copyright (c) 2021 Aaron Giles

YMFMIDI library - Copyright (c) 2021-2022 Devin Acker

Mod4Play library - Copyright (c) 2022 Olav Sørensen

minivorbis library - Copyright (c) 2020 Eduardo Bart
                     Copyright (c) 2002-2020 Xiph.org Foundation

===========================================================================================
CC 1.0 Universal License
===========================================================================================

minimp3 library - lieff

"ProtoSquare!" soundfont - Yingchun Soul

===========================================================================================
CC-BY-3.0 Unported License
===========================================================================================

German Shepherd Dog Sprites - Copyright (c) 2017 Nash Muhandes

===========================================================================================
CC-BY-NC-4.0 International License
===========================================================================================

REKKR (various assets) - Copyright (c) 2021 Mockingbird Softworks

===========================================================================================
CC-BY-SA-4.0 International License
===========================================================================================

"Bonkers for Bits" soundfont - Copyright (c) Marcel J. Therrien

"DMXOPL" and "DMXPOL3" instrument banks - Copyright (c) ConSiGno

===========================================================================================
GPL2 License
===========================================================================================

"Adplug" instrument bank - Copyright (C) 1999, 2000, 2001 Simon Peter, et al.

AJBSP - Copyright (c) 2000-2023 Andrew Apted, et al
        Copyright (c) 1994-1998 Colin Reed
        Copyright (c) 1997-1998 Lee Killough

COAL -  Copyright (c) 2009-2023 Andrew Apted, et al
        Copyright (c) 1996-1997 Id Software, Inc.

DDF library - Copyright (c) 1999-2023 The EDGE Team

DEHACKED library (formerly DEH_EDGE) - Copyright (c) 2004-2023 The EDGE Team

EC_VOXELIB library - Copyright (c) 2022-2023 The EDGE Team

EDGE-Classic - Copyright (c) 1999-2023 The EDGE Team

EPI library - Copyright (c) 2002-2023 The EDGE Team

Fluidlite library - Copyright (c) 2016 Robin Lobel

Game Music Emu - Copyright (c) 2003-2009 Shay Green

SuperFastHash - Copyright (c) 2004-2010 Paul Hsieh

XMIDI library - Copyright (c) 2015-2022 Vitaly Novichkov
                Copyright (c) 2015-2016 WildMIDI Developers
                Copyright (c) 2014 Bret Curtis
                Copyright (c) 2001 Ryan Nunn

===========================================================================================
MIT License
===========================================================================================

"16-Bit Game Station" soundfont - Copyright (c) 2022 Yingchun Soul

BW_Midi_Sequencer library - Copyright (c) 2015-2022 Vitaly Novichkov

gl4es library - Copyright (c) 2016-2018 Sebastien Chevalier
				Copyright (c) 2013-2016 Ryan Hileman

glad library - Copyright (c) 2013-2022 David Herberth

miniz library - Copyright (c) 2013-2014 RAD Game Tools and Valve Software
				Copyright (c) 2010-2014 Rich Geldreich and Tenacious Software LLC

PNPOLY algorithm - Copyright (c) 1970-2003 Wm. Randolph Franklin

"WadSmoosh" instrument bank - Copyright (c) 2016-2020 JP LeBreton

"C++ implementation of a fast Gaussian blur algorithm by Ivan Kutskir - Integer Version"
    - Copyright (C) 2017 Basile Fraboni
    - Copyright (C) 2014 Ivan Kutskir


===========================================================================================
Public Domain
===========================================================================================

Fraction.hpp - Bisqwit

"GMGSx" soundfont (renamed to default.sf2) - Kenneth Rundt

dr_wav and dr_flac libraries - David Reid

stb_image, stb_image_write, stb_rect_pack and stb_truetype libraries - Sean Barrett

"Unicode Processing with C++0x" Conversion Classes - Andrew Choi

===========================================================================================
WidePix License
===========================================================================================

WidePix (various assets) - Copyright (c) 2020-2021 Nash Muhandes

===========================================================================================
WTF License
===========================================================================================

crsid library - Copyright (c) 2022 Hermit (Mihaly Horvath)

===========================================================================================
zlib License
===========================================================================================

SDL2 library - Copyright (c) 1997-2020 Sam Lantinga
`

export default LicenseModal;
