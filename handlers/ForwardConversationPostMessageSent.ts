// tslint:disable:max-classes-per-file
import { Conversation, Message } from '../api';

import {
    IEnvironmentRead, IExecutionResult, IHttp, IHttpRequest, ILogEntry, IMessageRead, IPersistence, IRead, IRoomRead,
    LogMessageSeverity,
} from 'temporary-rocketlets-ts-definition/accessors';
import { IMessage, IPostMessageSentHandler } from 'temporary-rocketlets-ts-definition/messages';
import { IRoom } from 'temporary-rocketlets-ts-definition/rooms';
import { SmartiRocketlet } from '../SmartiRocketlet';

import HTTP_STATUS_CODES from 'http-status-enum';

class ForwardConversationExecutionResult implements IExecutionResult {
    public readonly failed: boolean;
    public readonly logMessages: Array<ILogEntry>;

    private readonly callerId: string;

    constructor(success: boolean, roomId: string, logMessages?: Array<ILogEntry>) {
        this.callerId = 'Smarti-forward-conversation';

        this.failed = success;
        this.logMessages = logMessages ? logMessages : [];

        if (success) {
            this.logMessages.push(
                {
                    caller: this.callerId,
                    severity: LogMessageSeverity.SUCCESS,
                    timestamp: new Date(),
                    args: [{roomId}],
                });
        } else {
            this.logMessages.push(
                {
                    caller: this.callerId,
                    severity: LogMessageSeverity.ERROR,
                    timestamp: new Date(),
                    args: [{roomId}],
                });
        }
    }
}

class ForwardConversationHttpRequest implements IHttpRequest {
    public data: object;

    constructor(room: IRoom, roomReader: IRoomRead) {
        this.data = this.getConversation(room, roomReader);
    }

    private getConversation(room: IRoom, roomReader: IRoomRead): Conversation {

        const messagesIterator = roomReader.getMessages(room.id);
        const conversation = new Conversation();

        while (messagesIterator.hasMore()) {
            let message: IMessage;

            message = messagesIterator.next().value;
            if (message.id && message.text && message.createdAt && message.sender) {
                conversation.messages.push({
                    id: message.id,
                    content: message.text,
                    time: message.createdAt,
                    origin: ( message.sender === room.creator ) ? Message.OriginEnum.User : Message.OriginEnum.Agent,
                    user: { id: message.sender.id },
                    private: false,
                });
            }
        }

        return conversation;
    }
}

export class ForwardConversationPostMessageSent implements IPostMessageSentHandler {
    private readonly hostUrl: string;

    constructor(environmentRead: IEnvironmentRead) {
        // todo this.hostUrl = environmentRead.getSettings().getById(SmartiRocketlet.smartiHostUrlSettingId);
    }

    // tslint:disable-next-line:max-line-length
    public executePostMessageSent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence): IExecutionResult {
        const response = http.post(this.hostUrl, new ForwardConversationHttpRequest(message.room, read.getRoomReader()));

        if (response.statusCode === HTTP_STATUS_CODES.OK) {
            return new ForwardConversationExecutionResult(true, message.room.id);
        } else {
            return new ForwardConversationExecutionResult(false, message.room.id);
        }
    }
}
