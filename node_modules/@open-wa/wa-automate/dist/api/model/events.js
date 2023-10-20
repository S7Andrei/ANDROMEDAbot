"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleListener = void 0;
/**
 * An enum of all the "simple listeners". A simple listener is a listener that just takes one parameter which is the callback function to handle the event.
 */
var SimpleListener;
(function (SimpleListener) {
    /**
     * Represents [[onMessage]]
     */
    SimpleListener["Message"] = "onMessage";
    /**
     * Represents [[onAnyMessage]]
     */
    SimpleListener["AnyMessage"] = "onAnyMessage";
    /**
     * Represents [[onMessageDeleted]]
     */
    SimpleListener["MessageDeleted"] = "onMessageDeleted";
    /**
     * Represents [[onAck]]
     */
    SimpleListener["Ack"] = "onAck";
    /**
     * Represents [[onAddedToGroup]]
     */
    SimpleListener["AddedToGroup"] = "onAddedToGroup";
    /**
     * Represents [[onChatDeleted]]
     */
    SimpleListener["ChatDeleted"] = "onChatDeleted";
    /**
     * Represents [[onBattery]]
     */
    SimpleListener["Battery"] = "onBattery";
    /**
     * Represents [[onChatOpened]]
     */
    SimpleListener["ChatOpened"] = "onChatOpened";
    /**
     * Represents [[onIncomingCall]]
     */
    SimpleListener["IncomingCall"] = "onIncomingCall";
    /**
     * Represents [[onIncomingCall]]
     */
    SimpleListener["CallState"] = "onCallState";
    /**
     * Represents [[onGlobalParticipantsChanged]]
     */
    SimpleListener["GlobalParticipantsChanged"] = "onGlobalParticipantsChanged";
    /**
     * Represents [[onGroupApprovalRequest]]
     */
    SimpleListener["GroupApprovalRequest"] = "onGroupApprovalRequest";
    /**
     * Represents [[onChatState]]
     */
    SimpleListener["ChatState"] = "onChatState";
    /**
     * Represents [[onLogout]]
     */
    SimpleListener["Logout"] = "onLogout";
    // Next two require extra params so not available to use via webhook register
    // LiveLocation = 'onLiveLocation',
    // ParticipantsChanged = 'onParticipantsChanged',
    /**
     * Represents [[onPlugged]]
     */
    SimpleListener["Plugged"] = "onPlugged";
    /**
     * Represents [[onStateChanged]]
     */
    SimpleListener["StateChanged"] = "onStateChanged";
    /**
     * Represents [[onButton]]
     */
    SimpleListener["Button"] = "onButton";
    /**
     * Represents [[onButton]]
     */
    SimpleListener["PollVote"] = "onPollVote";
    /**
     * Represents [[onBroadcast]]
     */
    SimpleListener["Broadcast"] = "onBroadcast";
    /**
     * Represents [[onLabel]]
     */
    SimpleListener["Label"] = "onLabel";
    /**
     * Requires licence
     * Represents [[onStory]]
     */
    SimpleListener["Story"] = "onStory";
    /**
     * Requires licence
     * Represents [[onRemovedFromGroup]]
     */
    SimpleListener["RemovedFromGroup"] = "onRemovedFromGroup";
    /**
     * Requires licence
     * Represents [[onContactAdded]]
     */
    SimpleListener["ContactAdded"] = "onContactAdded";
    /**
     * Requires licence
     * Represents [[onContactAdded]]
     */
    SimpleListener["Order"] = "onOrder";
    /**
     * Requires licence
     * Represents [[onNewProduct]]
     */
    SimpleListener["NewProduct"] = "onNewProduct";
    /**
     * Requires licence
     * Represents [[onReaction]]
     */
    SimpleListener["Reaction"] = "onReaction";
    /**
     * Requires licence
     * Represents [[onGroupChange]]
     */
    SimpleListener["GroupChange"] = "onGroupChange";
})(SimpleListener = exports.SimpleListener || (exports.SimpleListener = {}));
