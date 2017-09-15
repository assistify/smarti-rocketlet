// tslint:disable:max-classes-per-file
import {
    IEnvironmentRead, IExecutionResult, IHttp, IHttpRequest, ILogEntry, IPersistence, IRead, LogMessageSeverity,
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

    constructor(room: IRoom) {
        this.data = this.getConversation(room);
    }

    private getConversation(room: IRoom) {
        return {}; // todo
    }
}

export class ForwardConversationPostMessageSent implements IPostMessageSentHandler {
    private readonly hostUrl: string;

    constructor(environmentRead: IEnvironmentRead) {
        // todo this.hostUrl = environmentRead.getSettings().getById(SmartiRocketlet.smartiHostUrlSettingId);
    }

    // tslint:disable-next-line:max-line-length
    public executePostMessageSent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence): IExecutionResult {
        const response = http.post(this.hostUrl, new ForwardConversationHttpRequest(message.room));

        if (response.statusCode === HTTP_STATUS_CODES.OK) {
            return new ForwardConversationExecutionResult(true, message.room.id);
        } else {
            return new ForwardConversationExecutionResult(false, message.room.id);
        }
    }
}
