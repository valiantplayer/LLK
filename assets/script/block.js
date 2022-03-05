
cc.Class({
    extends: cc.Component,

    properties: {
       node_click:{
           type:cc.Node,
           default:null
       },
       sp_yuanSu:{
            type:cc.Node,
            default:null
       },
    },

    onLoad () {
        this.node_click.active = false
    },

    //创建元素
    createYuanSu:function(_type){
        this.i_type = _type

        var self = this;
        var url = "img/2/drawable_s" + _type;
        cc.resources.load(url, cc.SpriteFrame, null, function (err, spriteFrame) {
            self.sp_yuanSu.getComponent(cc.Sprite).spriteFrame = spriteFrame
        });
    },

    //是否选中
    setClick:function(is_click){
        this.node_click.active = is_click
    },

    // update (dt) {},
});
