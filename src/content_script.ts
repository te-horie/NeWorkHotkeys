import { NeWorkHotkeys } from './NeWorkHotkeys';
const hotkeys = new NeWorkHotkeys();
const commands = {
    "toggle_talk": () => hotkeys.toggleTalk(),
};
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    commands[request.command]();
    sendResponse("ok");
    return true; // necessary for asynchronous messaging
});
