import { _decorator, Component, Node, tween, UIOpacityComponent } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { constant } from '../../framework/constant';
import { uiManager } from '../../framework/uiManager';
const { ccclass, property } = _decorator;

@ccclass('loadingPanel')
export class loadingPanel extends Component {

    @property(UIOpacityComponent)
    public opacityCom: UIOpacityComponent = null;

    onEnable(): void {
        clientEvent.on(constant.EVENT_TYPE.SHOW_LOADING_PANEL, this._showLoadingPanel, this)
        clientEvent.on(constant.EVENT_TYPE.HIDE_LOADING_PANEL, this._hideLoadingPanel, this)
    }
    private _hideLoadingPanel() {
        tween(this.opacityCom)
            .to(2, { opacity: 200 }, { easing: 'smooth' })
            .to(1, { opacity: 50 }, { easing: 'smooth' })
            .call(() => {
                uiManager.instance.hideDialog("loading/loadingPanel")
                // uiManager.instance.showDialog("parkour/parkourPanel", [this])
            })
            .start()
    }

    start() {

    }

    public show() {
        this._showLoadingPanel()
    }
    private _showLoadingPanel() {
        this.opacityCom.opacity = 255
    }

    update(deltaTime: number) {

    }
}


