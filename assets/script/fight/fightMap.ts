import { _decorator, AnimationComponent, Component, Node, RigidBodyComponent } from 'cc';
import { localConfig } from '../framework/localConfig';
import { resourceUtil } from '../framework/resourceUtil';
import { poolManager } from '../framework/poolManager';
import { constant } from '../framework/constant';
import { Enemy } from './enemy';
import { Box } from './box';
import { ColliderItem } from './colliderItem';
import { GameManager } from './gameManger';
const { ccclass, property } = _decorator;

@ccclass('FightMap')
export class FightMap extends Component {
    private _completeListener: Function = () => { };
    private _dictModuleType: {};
    private _arrItem: any[];
    private _arrMap: any[];
    private _loadResLength: any;

    public static ndRoadEnd: Node;
    public static ndEnemy: Node;
    public static scriptEnemy: Enemy;
    public static ndBox: Node;

    buildMap(mapName: string, progressCb: Function, completeCb: Function) {
        this._completeListener = completeCb
        this._dictModuleType = {}
        this._arrItem = []
        this._arrMap = []

        let moduleData = localConfig.instance.getTableArr("module")
        moduleData.forEach((item) => {
            if (!this._dictModuleType.hasOwnProperty[item.type]) {
                this._dictModuleType[item.type] = []
            }
        })

        this._arrMap = localConfig.instance.getTableArr(mapName).concat()

        this._buildRoad(() => {
            this._arrMap = this._arrMap.sort((a: any, b: any) => {
                let aPosZ = Number(a.position.split(",")[2])
                let bPosZ = Number(b.position.split(",")[2])

                return aPosZ - bPosZ
            })

            for (let i = this._arrMap.length - 1; i >= 0; i--) {
                const item = this._arrMap[i]
                let z = Number(item.position.split(",")[2])

                if (z > GameManager.oriPlayerWorPos.z - this._loadResLength) {
                    let moduleInfo = localConfig.instance.queryByID("module", item.name)
                    this._dictModuleType[moduleInfo.type].push(item)

                    this._arrMap.splice(i, 1)
                }

            }

            let arrPromise = []

            for (const i in this._dictModuleType) {

                let item = this._dictModuleType[i]
                if (item.length == 0) {
                    arrPromise.push(this._buildModel(i))
                }
            }

            Promise.all(arrPromise).then(() => {
                this._completeListener && this._completeListener()
            }).catch((err) => {
                console.log("load item module err:", err)
            })
        })

    }
    private _buildModel(type: string): any {
        return new Promise((resolve, reject) => {
            let arrPromise = []
            let objItems = this._dictModuleType[type]
            this._dictModuleType[type] = []

            for (let idx = 0; idx < objItems.length; idx++) {
                let child = objItems[idx]
                let moduleInfo = localConfig.instance.queryByID("module", child.name)
                let modulePath = `${type}/${moduleInfo.name}`
                let p = resourceUtil.loadMapModelRes(modulePath).then((prefab: any) => {
                    let parentName = type + "Group"
                    let ndParent = this.node.getChildByName(parentName)
                    if (!ndParent) {
                        ndParent = new Node(parentName)
                        ndParent.parent = this.node
                    }
                    let ndChild = poolManager.instance.getNode(prefab, ndParent) as Node
                    let position = child.position ? child.position.split(",") : moduleInfo.position.split(",")
                    let scale = child.scale ? child.scale.split(",") : moduleInfo.scale.split(",")
                    ndChild.setPosition(Number(position[0]), Number(position[1]), Number(position[2]))
                    ndChild.setScale(Number(scale[0]), Number(scale[1]), Number(scale[2]))

                    if (child.name == constant.MODULE_TYPE.ROAD_11) {
                        FightMap.ndRoadEnd = ndChild
                        let ndFireGroup = FightMap.ndRoadEnd.getChildByName("fireGroup") as Node
                        ndFireGroup.active = false
                    } else if (child.name == constant.MODULE_TYPE.PEOPLE_ENEMY) {
                        FightMap.ndEnemy = ndChild
                        FightMap.scriptEnemy = FightMap.ndEnemy.getComponent(Enemy) as Enemy
                        FightMap.scriptEnemy.init()
                    } else if (child.name == constant.MODULE_TYPE.BOX) {
                        FightMap.ndBox = ndChild
                        let aniComBox = ndChild.getChildByName("box").getComponent(AnimationComponent) as AnimationComponent
                        aniComBox.getState("boxOpen").time = 0
                        aniComBox.getState("boxHit").time = 0
                        aniComBox.getState("boxOpen").sample()
                        aniComBox.getState("boxHit").sample()
                    } else if (child.name == constant.MODULE_TYPE.ROAD_13) {
                        FightMap.ndRoadEnd = ndChild
                        let arrBrickGroup1 = FightMap.ndRoadEnd.getChildByName("brick01Group")?.getComponentInChildren(RigidBodyComponent) as any
                        let arrBrickGroup2 = FightMap.ndRoadEnd.getChildByName("brick02Group")?.getComponentInChildren(RigidBodyComponent) as any;

                        let arrBrickGroup = arrBrickGroup1?.concat(arrBrickGroup2)

                        arrBrickGroup.forEach((item: RigidBodyComponent) => {
                            item.enabled = false
                            item.useGravity = false
                            item.sleep()
                        })
                    } else if (child.name == constant.MODULE_TYPE.PEOPLE_GREEN || child.name == constant.MODULE_TYPE.PEOPLE_RED || child.name == constant.MODULE_TYPE.PEOPLE_YELLOW) {
                        let scriptPeople = ndChild.getComponent(ColliderItem) as ColliderItem
                        scriptPeople.init()
                    }
                    resolve(null)
                })
                arrPromise.push(p)
            }
            Promise.all(arrPromise).then(() => {
                let arr = this._arrItem.sort((a: any, b: any) => {
                    let aPosZ = a.worldposition.z
                    let bPosZ = b.worldposition.z
                    return aPosZ - bPosZ
                })

                this._arrItem = arr
                resolve(null)
            }).catch((err) => {
                console.log("e", err)
            })

        })
    }
    private _buildRoad(callback: () => void) {
        for (let i = this._arrMap.length - 1; i >= 0; i--) {
            let element = this._arrMap[i]
            let moduleInfo = localConfig.instance.queryByID("module", element.name)
            if (moduleInfo.type == "road") {
                this._dictModuleType["road"].push(element)
                this._arrMap.splice(i, 1)
            }

        }

        this._buildModel("road").then(() => {
            callback && callback()
        }).catch((err) => {
            console.log("load road module err:", err)
        })
    }
    recycle() {
       
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


