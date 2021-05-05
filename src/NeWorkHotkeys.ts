import 'chrome-extension-async';

export class NeWorkHotkeys {
    static readonly KEY_SETTINGS = "settings";
    private readonly observer: MutationObserver = new MutationObserver(this.playSound.bind(this));
    // @ts-ignore
    private cache: Promise<StorageCache>;
    private audios: { [key: string]: HTMLAudioElement }
    constructor() {
        this.audios = {
            "open": new Audio(chrome.extension.getURL("open.mp3")),
            "work": new Audio(chrome.extension.getURL("work.mp3")),
        };
    }
    async enableWork(): Promise<void> {
        (document.querySelector('li.work > button') as HTMLElement).click();
        this.play("work");
    }
    async enableOpen(): Promise<void> {
        this.play("open");
        // wait until sound end
        setTimeout(() => { (document.querySelector('li.open > button') as HTMLElement).click() }, 300);
    }
    playSound(records: MutationRecord[]) {
        const btn = (records[0].target as Element);
        if (btn.hasAttribute('disabled') === false) {
            const status = (btn.getAttribute('aria-pressed') === 'true');
            if (status !== null) {  // unknown status
                if (status === true) {  // `aria-pressed: true` is mute
                    this.play('work');
                }
                else {  // mic is unmute
                    this.play('open');
                }
            }
            else {
                console.warn(`button status is unknown. 'aria-pressed' status is: ${btn.getAttribute('aria-pressed')}`);
            }
            this.observer.disconnect();
        }
    }
    toggleTalk(): void {
        const micButton = (document.querySelector('div.go4273220301 button.go1674640006') as HTMLElement);
        if (micButton !== null) {
            this.observer.takeRecords();  // clear the queue
            this.observer.disconnect();
            this.observer.observe(micButton, { attributes: true, attributeFilter: ['disabled'] });
            micButton.click();
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
    async isSoundEnabled(): Promise<boolean> {
        const cache = await this.getCache();
        return cache.settings.soundEnabled;
    }
    async play(cls: string): Promise<void> {
        const isSoundEnabled = await this.isSoundEnabled()
        if (!isSoundEnabled) {
            return;
        }
        const audio = this.audios[cls];
        if (audio.paused) {
            audio.play();
        } else {
            audio.currentTime = 0;
        }
    }
}
