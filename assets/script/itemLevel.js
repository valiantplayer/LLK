
cc.Class({
    extends: cc.Component,

    properties: {
        nodeLevel: {
            type: cc.Node,
            default: null
        },
        node_btn: {
            type: cc.Node,
            default: null
        },
        node_sp: {
            type: cc.Node,
            default: null
        },
    },

    onLoad() { },

    init: function (i_level) {
        this.num_level = i_level
        this.nodeLevel.getComponent(cc.Label).string = this.num_level
    },

    //可以玩
    canPlay: function (is_can) {
        if (is_can) {
            this.node_btn.active = true
            this.node_sp.active = false
        } else {
            this.node_btn.active = false
            this.node_sp.active = true
        }
    },
    btn_callBack() {
        game.numLevel = this.num_level;
        game.gamePlay();
    },
    start() {

    },

    // update (dt) {},
});
