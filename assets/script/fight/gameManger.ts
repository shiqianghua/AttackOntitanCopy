import { _decorator, CameraComponent, Component, Node, Vec3 } from 'cc';
import { GameCamera } from './gameCamera';
import { clientEvent } from '../framework/clientEvent';
import { constant } from '../framework/constant';
import { uiManager } from '../framework/uiManager';
import { playerData } from '../framework/playerData';
import { localConfig } from '../framework/localConfig';
import { resourceUtil } from '../framework/resourceUtil';
import { poolManager } from '../framework/poolManager';
import { Player } from './player';
// import { FightMap } from './fightMap';
import { FightMap } from './fightMap';

// const { FightMap } = require('./fightMap')
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(GameCamera)
    public camera: GameCamera;

    @property(Node)
    public scriptMapManager: Node = null;

    @property(Node)
    public ndWater: Node = null;

    @property(Node)
    public ndSkyBox: Node = null;

    @property(Node)
    public ndLight: Node = null;

    public people: number;
    public diamond: number;
    public multiple: number;
    public hitFlyEnemyPower: number;
    public mapInfo: any;

    public static mainCamera: CameraComponent;
    public static scriptGameCamera: GameCamera;
    public static ndGameManager: Node;
    public static isGameStart: boolean;
    public static isGamePause: boolean;
    public static gameSpeed: number;
    public static isGameOver: boolean;
    public static gameStatus: string;
    public static isWin: boolean;
    public static isRevive: boolean;
    public static isArriveEndLine: boolean;
    public static ndPlayer: any;
    public static gameType: number;
    public static scriptPlayer: Player;
    public static oriPlayerWorPos: Vec3 = new Vec3(0, 1, -1);

    private _oriWaterWorPos: Vec3;
    private _oriSkyBoxWorPos: Vec3;
    private _oriMainLightWorPos: Vec3;


    start() {
        GameManager.mainCamera = this.camera?.getComponent(CameraComponent) as CameraComponent;
        GameManager.scriptGameCamera = this.camera?.getComponent(GameCamera) as GameCamera;
        GameManager.ndGameManager = this.node

        this._oriWaterWorPos = this.ndWater.worldPosition.clone()
        this._oriSkyBoxWorPos = this.ndSkyBox.worldPosition.clone()
        this._oriMainLightWorPos = this.ndLight.worldPosition.clone()
    }

    onEnable(): void {
        clientEvent.on(constant.EVENT_TYPE.ON_INIT_GAME, this._onInitGame, this)

    }

    onDisable(): void {
        clientEvent.off(constant.EVENT_TYPE.ON_INIT_GAME, this._onInitGame, this)
    }

    private _onInitGame() {
        uiManager.instance.showDialog("loading/loadingPanel")

        GameManager.isGameStart = false
        GameManager.isGamePause = false
        GameManager.isGameOver = false
        GameManager.gameSpeed = 1
        GameManager.gameStatus = constant.GAME_STATUS.RUN
        GameManager.scriptGameCamera.resetCamera()
        GameManager.isWin = false
        GameManager.isRevive = false
        GameManager.isArriveEndLine = false
        GameManager.ndPlayer?.destroy()
        GameManager.ndPlayer = null

        this.diamond = 0
        this.people = 0
        this.multiple = 0
        this.hitFlyEnemyPower = 0

        this.ndWater.setPosition(this._oriWaterWorPos)
        this.ndSkyBox.setPosition(this._oriSkyBoxWorPos)

        playerData.instance.addFightTimes()

        this._refreshLevel()
    }
    private _refreshLevel() {

        this.scriptMapManager.getComponent(FightMap).recycle()

        this._loadMap(() => {
            this._createPlayer()
        })
    }

    private _createPlayer() {
        resourceUtil.loadModelRes("man/player").then((pf: any) => {
            GameManager.ndPlayer = poolManager.instance.getNode(pf, this.node) as Node

            let scriptGameCamera = GameManager.mainCamera?.node.getComponent(GameCamera) as GameCamera
            scriptGameCamera.ndFollowTarget = GameManager.ndPlayer

            let srciptPlayer = GameManager.ndPlayer?.getComponent(Player) as Player
            GameManager.scriptPlayer = srciptPlayer
            clientEvent.dispatchEvent(constant.EVENT_TYPE.HIDE_LOADING_PANEL)
        })

    }

    private _loadMap(cb: Function = () => { }) {
        let level = playerData.instance.playerInfo.level
        this.mapInfo = localConfig.instance.queryByID("map", level)
        GameManager.gameType = Number(this.mapInfo.type)
        this.scriptMapManager.getComponent(FightMap).buildMap(this.mapInfo.mapName, () => { }, () => {
            cb && cb()
        })
    }

    update(deltaTime: number) {

    }
}


