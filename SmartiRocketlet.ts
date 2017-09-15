import { IConfigurationExtend, IEnvironmentRead, ILogger } from 'temporary-rocketlets-ts-definition/accessors';
import { IRocketletInfo } from 'temporary-rocketlets-ts-definition/metadata';
import { Rocketlet } from 'temporary-rocketlets-ts-definition/Rocketlet';
import { SettingType } from 'temporary-rocketlets-ts-definition/settings';
import { ResultResponseHandler } from './handlers/ResultResponseHandler';

export class SmartiRocketlet extends Rocketlet {
    private readonly smartiHostUrlSettingId: string;
    private readonly smartiClientDomainSettingId: string;
    private readonly smartiHookTokenSettingId: string;

    constructor(info: IRocketletInfo, logger: ILogger) {
        super(info, logger);
        this.smartiHostUrlSettingId = 'smarti-host-url';
        this.smartiClientDomainSettingId = 'smarti-client-domain';
        this.smartiHookTokenSettingId = 'smarti-hook-token';
    }

    protected extendConfiguration(configuration: IConfigurationExtend): void {
        this.provideSettings(configuration);
        this.registerResultsHandler(configuration);
    }

    private registerResultsHandler(configuration: IConfigurationExtend) {
        configuration.http.providePreResponseHandler(new ResultResponseHandler(this.getLogger()));
    }

    private provideSettings(configuration: IConfigurationExtend) {
        configuration.settings.provideSetting({
            id: this.smartiHostUrlSettingId,
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Smarti_Host_Url',
            i18nDescription: 'Smarti_Host_Url_Description',
        });

        // todo: @thomaskurz Do we actually need an explicit endpoint
        //                   - or are we just using the (promised) http-response
        // configuration.settings.provideSetting({
        //     id: this.smartiHookTokenSettingId,
        //     type: SettingType.STRING,
        //     packageValue: 'key123',
        //     required: true,
        //     public: false,
        //     i18nLabel: 'Smarti_Hook_Token',
        //     i18nDescription: 'Smarti_Hook_Token_Description',
        // });

        let domain: string;

        // todo: By default, we'd like to derive the domain from the Site-URL
        /*
        const environmentRead: IEnvironmentRead;
        domain = environmentRead.getSettings().getById('Site_Url')
        if (domain) {
            domain = domain
                .replace('https://', '')
                .replace('http://', '');
            while (domain.charAt(domain.length - 1) === '/') {
                domain = domain.substr(0, domain.length - 1);
            }
        }*/
        domain = 'rocketlet-test';

        configuration.settings.provideSetting({
            id: this.smartiClientDomainSettingId,
            type: SettingType.STRING,
            packageValue: domain,
            required: true,
            public: false,
            i18nLabel: 'Smarti_Client_Domain',
            i18nDescription: 'Smarti_Client_Domain_Description',
        });
    }
}
