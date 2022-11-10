import * as Electron from 'electron';
import { ElectronWindow } from './typings/electron.window';


declare let window: ElectronWindow;

export class ElectronService {
    private _electron: typeof Electron;

    private get electron(): typeof Electron {
        if (!this._electron) {
            console.log(window)
            if (window ) {
                this._electron = require('electron');
                //this._electron = window.require('electron');
                console.log("IMPORTANDO!!! ")
                console.log(this._electron)
                return this._electron;
            }
            console.log("DEVUELVE NULL")
            return null;
        }
        return this._electron;
    }

    /**
     * determines if SPA is running in Electron
     */
    public get isElectronApp(): boolean {
        return !!window.navigator.userAgent.match(/Electron/);
    }

    public get isMacOS(): boolean {
        return this.isElectronApp && process.platform === 'darwin';
    }

    public get isWindows(): boolean {
        return this.isElectronApp && process.platform === 'win32';
    }

    public get isLinux(): boolean {
        return this.isElectronApp && process.platform === 'linux';
    }

    public get isX86(): boolean {
        return this.isElectronApp && process.arch === 'ia32';
    }

    public get isX64(): boolean {
        return this.isElectronApp && process.arch === 'x64';
    }

    public get isArm(): boolean {
        return this.isElectronApp && process.arch === 'arm';
    }

    public get desktopCapturer(): Electron.DesktopCapturer {
        return this.electron ? this.electron.desktopCapturer : null;
    }

    public get ipcRenderer(): Electron.IpcRenderer {
        return this.electron ? this.electron.ipcRenderer : null;
    }

    public get webFrame(): Electron.WebFrame {
        return this.electron ? this.electron.webFrame : null;
    }

    public get clipboard(): Electron.Clipboard {
        return this.electron ? this.electron.clipboard : null;
    }

    public get crashReporter(): Electron.CrashReporter {
        return this.electron ? this.electron.crashReporter : null;
    }

    public get nativeImage(): typeof Electron.nativeImage {
        return this.electron ? this.electron.nativeImage : null;
    }

    public get shell(): Electron.Shell {
        return this.electron ? this.electron.shell : null;
    }
}
