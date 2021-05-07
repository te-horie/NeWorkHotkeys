import 'chrome-extension-async';

export class NeWorkHotkeys {
    static readonly KEY_SETTINGS = "settings";
    // @ts-ignore
    private cache: Promise<StorageCache>;
    private audios: { [key: string]: HTMLAudioElement }
    private readonly observer: MutationObserver;
    constructor() {
        this.audios = {
            unmute: new Audio(chrome.extension.getURL("open.mp3")),
            mute: new Audio(chrome.extension.getURL("work.mp3")),
        };
        this.observer = new MutationObserver(this.playSound.bind(this));
    }
    private playSound(records: MutationRecord[]) {
        const btn = (records[0].target as HTMLElement);
        if (btn.hasAttribute('disabled') === false) {
            const status = btn.getAttribute('aria-pressed');
            if (status !== null) {
                if (status === 'true') {  // `aria-pressed: true` means mute.
                    this.play('mute');
                }
                else {  // mic is unmute
                    this.play('unmute');
                }
            }
            else {
                console.warn(`button status is unknown. 'aria-pressed': ${btn.getAttribute('aria-pressed')}`);
            }
            this.observer.disconnect();
        }
    }
    private getMicToggleButton(): HTMLElement | null {
        const micButton = (document.querySelector('div.go2292276745 > button.go1674640006:nth-child(1)') as HTMLElement);
        if (micButton === null) {
            return null;
        }

        const title = micButton.getAttribute('title');
        if (title === 'マイクをオンにする' || title === 'マイクをミュートにする') {
            return micButton;
        }
        else {
            return null;
        }
    }
    public async toggleMic(): Promise<void> {
        const micButton = this.getMicToggleButton();
        if (micButton !== null) {
            if (!micButton.hasAttribute('disabled')) {
                if (await this.isSoundEnabled()) {
                    this.observer.takeRecords();  // clear the queue
                    this.observer.disconnect();
                    this.observer.observe(micButton, { attributes: true, attributeFilter: ['disabled'] });
                }
                micButton.click();
            }
        }
        else {
            // mic button not found.
            // [TODO] Play a beep.
        }
    }
    private async getCache(): Promise<StorageCache> {
        let cache = this.cache;
        if (!cache) {
            cache = this.cache = <Promise<StorageCache>> await chrome.storage.local.get({
                [NeWorkHotkeys.KEY_SETTINGS]: { soundEnabled: true }
            });
        }
        return cache;
    }
    private async isSoundEnabled(): Promise<boolean> {
        const cache = await this.getCache();
        return cache.settings.soundEnabled;
    }
    private async play(cls: string): Promise<void> {
        const audio = this.audios[cls];
        if (audio.paused) {
            audio.play();
        } else {
            audio.currentTime = 0;
        }
    }
}
