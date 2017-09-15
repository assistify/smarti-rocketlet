import {
    IHttpPreResponseHandler,
    IHttpResponse,
    ILogger,
    IPersistence,
    IRead,
} from 'temporary-rocketlets-ts-definition/accessors';

// todo: @graywolf336: How to get
import HTTP_STATUS_CODES from 'http-status-enum';

/**
 * Handles responses issued from Smarti and persists the result in a custom collection
 */
export class ResultResponseHandler implements IHttpPreResponseHandler {
    private logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    public executePreHttpResponse(response: IHttpResponse, read: IRead, persistence: IPersistence): IHttpResponse {
        try {
            persistence.update(response.data.channelId,
                {
                    rid: response.data.channelId,
                    conversationId: response.data.conversationId,
                    token: response.data.token,
                    ts: new Date(),
                },
                // todo true //upsert
            );

            return response;

        } catch (e) {
            this.getLogger().error('response-could-not-be-processed', response.data, e);
            response.statusCode = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

            return response;
        }
    }

    private getLogger(): ILogger {
        return this.logger;
    }

    private validateResonseSchema(): void {
        // todo: validate contract compliance
    }
}
