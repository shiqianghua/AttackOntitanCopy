import { _decorator, Component, game, Node, PhysicsSystem } from 'cc';
import { StorageManager } from './framework/storageManager';
import { constant } from './framework/constant';
import { uiManager } from './framework/uiManager';
import { playerData } from './framework/playerData';
import { localConfig } from './framework/localConfig';
import { GameLogic } from './framework/gameLogic';
import { clientEvent } from './framework/clientEvent';
const { ccclass, property } = _decorator;

@ccclass('main')
export class main extends Component {
    start() {
        let frameRate = StorageManager.instance.getConfigData("frameRate") ?? constant.GAME_FRAME
        game.setFrameRate(frameRate)

        PhysicsSystem.instance.fixedTimeStep = 1 / frameRate

        uiManager.instance.showDialog("loading/loadingPanel")

        playerData.instance.loadGlobalCache()

        if (!playerData.instance.userId) {
            playerData.instance.generateRandomAccount()
            console.log("随机生成userId", playerData.instance.userId)
        }

        playerData.instance.loadFromCache()

        if (!playerData.instance.playerInfo || !playerData.instance.playerInfo.createDate) {
            playerData.instance.createPlayerInfo()
        }

        localConfig.instance.loadConfig(() => {
            this._loadFinish()
            GameLogic.shareGame("奔跑吧巨人", "")
        })
    }
    private _loadFinish() {
        playerData.instance.refreshSkinStatus()
        playerData.instance.isLoadFinished = true
        clientEvent.dispatchEvent(constant.EVENT_TYPE.ON_INIT_GAME)
    }

    update(deltaTime: number) {

    }
}


