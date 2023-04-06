import { EnumFactoryBase } from 'lite-ts-enum';
import { RpcBase } from 'lite-ts-rpc';

import { ExpireTimeHandlerBase } from './expire-time-handler-base';
import { ValueHandlerOption } from './value-handler-option';
import { Time } from './value-type-data';

export class UpdateTargetTimeValueHandler extends ExpireTimeHandlerBase {
    public constructor(
        protected getNowFunc: () => Promise<number>,
        private m_Rpc: RpcBase,
        private m_UserID: string,
        enumFactory: EnumFactoryBase
    ) {
        super(
            getNowFunc,
            enumFactory
        );
    }

    protected async handling(option: ValueHandlerOption, time: Time) {
        if (!time.targetType)
            return;

        const now = await this.getNowFunc();
        const ownValue = await option.valueService.ownValue;
        if (now > (ownValue[time.expiredOnValueType] || 0))
            ownValue[option.value.valueType] = 0;

        const res = await this.m_Rpc.call<number>({
            route: `/${time.targetType.app}/get-expire-time`,
            body: {
                areaNo: option.areaNo ?? 0,
                userID: this.m_UserID,
                ext: time.targetType.ext
            }
        });
        ownValue[time.expiredOnValueType] = res.data;
    }
}