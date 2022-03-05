/**
 * scrollView优化
 * 优化策略，item复用，超出视野上方外的item，改变位置到下面复用
 * item的锚点需要设置为cc.p(0.5,0.5)
 * autor：lch
 * time 2020.07.23
 */
 const { ccclass, property } = cc._decorator;
 @ccclass
 export default class ListViewCtrl extends cc.Component {
 
     //放入节点或者预制体，默认使用节点
     @property(cc.Prefab)
     itemPrefab: cc.Prefab = null
 
     @property(cc.Node)
     itemNode: cc.Node = null
 
     @property(cc.ScrollView)
     scrollView: cc.ScrollView = null
 
 
     @property({ tooltip: "当前正常显示的数量,默认是20", type: cc.Integer })
     spawnCount: number = 20 // 当前正常显示的数量
     @property({ tooltip: "item之间的间隔", type: cc.Integer })
     spacing: number = 0 // item之间的间隔
     @property({ tooltip: "缓冲区，当超出改缓冲区，改变item的位置", type: cc.Integer })
     bufferZone: number = 1000 // 缓冲区，当超出改缓冲区，改变item的位置
 
     totalCount: number = 0 // how many items we need for the whole list
     updateInterval: number = 0.2//检测更新位置时间间隔 
     content: cc.Node;
     items: any[];
     nodePool: cc.NodePool;
     itemTemplate: any;
     private _bottomFunc: any;
     lasttotalCount: number;
     private _isLock: boolean;
     itemDatas: any;
     updateTimer: number;
     lastContentPosY: number;
     private _itemCtrlFunc: any;
 
 
     onLoad() {
         if (!this.scrollView) {
             this.scrollView = this.node.getComponent(cc.ScrollView)
         }
         this.content = this.scrollView.content;
         this.items = [];
         this.nodePool = new cc.NodePool();
         this.itemTemplate = this.itemNode || this.itemPrefab
 
         this.recycleItem()
 
         this.node.on('bounce-bottom', this.bounceBottom, this);
     }
 
     /**设置滑动到底部的回调 */
     setBounceBottom(func) {
         this._bottomFunc = func;
     }
 
     /**设置刷新item的方法 */
     setItemCtrlFunc(func) {
         this._itemCtrlFunc = func
     }
 
     //使用自定义的节点
     setItemNode(node) {
         if (cc.isValid(node)) {
             this.itemTemplate = node
             this.initUIByData([])
             this.nodePool.clear()
         }
     }
 
     bounceBottom() {
         let offset = this.scrollView.getScrollOffset();
         if (this.lasttotalCount == this.totalCount) {
             return;
         }
         this.lasttotalCount = this.totalCount
         if (this._bottomFunc != null) {
             this._bottomFunc(offset);
         }
 
         console.log("bounceBottom")
     }
 
     recycleItem() {
         // 回收item
         let children = this.content.children;
         let count = children.length
         for (let idx = count - 1; idx > -1; idx--) {
             this.nodePool.put(children[idx]);
         }
         this.items = [];
     }
 
     initUIByData(data: any[]) {
         if (data) {
             this._isLock = true;
             this.itemDatas = data;
             this.totalCount = data.length || 0;
             this.updateTimer = 0;
             this.lastContentPosY = 0; // 使用这个变量来检测是向上还是向下滚动
             this.initialize();
         }
     }
 
     initialize() {
         this.scrollView.stopAutoScroll();
         this.scrollView.scrollToTop();
         this.recycleItem()
 
         let node_height = this.itemTemplate.height || this.itemTemplate.data.height
         this.content.height = this.totalCount * (node_height + this.spacing) + this.spacing; // get total content height
         let curspawnCount = this.spawnCount
         if (curspawnCount > this.totalCount) {
             curspawnCount = this.totalCount
         }
         for (let i = 0; i < curspawnCount; ++i) {
             let item = this.nodePool.get();
             if (item == null) {
                 item = cc.instantiate(this.itemTemplate);
             }
             item.active = true
             this.content.addChild(item);
             item.setPosition(0, -item.height * (0.5 + i) - this.spacing * (i + 1));
 
             item["itemIndex"] = i
             this.initItemByData(item, this.itemDatas[i])
             this.items.push(item);
         }
         this._isLock = false;
     }
 
     getPositionInView(item) { // 获取item的视野位置
         let worldPos = item.parent.convertToWorldSpaceAR(item.position);
         let viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
         return viewPos;
     }
 
     update(dt) {
         if (this._isLock) return;
 
         this.updateTimer += dt;
         if (this.updateTimer < this.updateInterval) return; // 我们不需要每一帧都要检测
         this.updateTimer = 0;
 
         let items = this.items;
         let buffer = this.bufferZone;
         let isDown = this.scrollView.content.y < this.lastContentPosY; // 当前的content的位置比上次的小，那么说明往下滑动，反之是往上滑动
 
         let node_height = this.itemTemplate.height || this.itemTemplate.data.height
         let offset = (node_height + this.spacing) * items.length;
         for (let i = 0; i < items.length; ++i) {
             let viewPos = this.getPositionInView(items[i]);
             if (isDown) {//往下滑
                 // item超出了设置的视野缓冲区范围，并且滑动未到达content顶部
                 if (viewPos.y < -buffer && items[i].y + offset < 0) {
                     items[i].y = items[i].y + offset;
 
                     let itemId = items[i].itemIndex - items.length; // update item id
                     items[i].itemIndex = itemId;
                     this.initItemByData(items[i], this.itemDatas[itemId])
                 }
             } else {
                 // item超出了设置的视野缓冲区范围，并且滑动未到达content底部
                 if (viewPos.y > buffer && items[i].y - offset > -this.content.height) {
                     items[i].y = items[i].y - offset;// 把item的位置放到最下面
 
                     let itemId = items[i].itemIndex + items.length; // update item id
                     items[i].itemIndex = itemId;
                     this.initItemByData(items[i], this.itemDatas[itemId])
                 }
             }
         }
         // update lastContentPosY
         this.lastContentPosY = this.scrollView.content.y;//记录当前content的位置
     }
 
 
     scrollToIndex(index, time?) {
         if (index < 0) index = 0
         if (index > this.totalCount) index = this.totalCount
         let _time = time || 0
 
         let maxScrollOffset = this.scrollView.getMaxScrollOffset();
         let node_height = this.itemTemplate.height || this.itemTemplate.data.height
         let _y = (node_height + this.spacing) * index
         if (_y > maxScrollOffset.y) {
             _y = maxScrollOffset.y
         }
 
         this.scrollToOffset(cc.v2(maxScrollOffset.x, _y), time)
         this.update(this.updateInterval)
     }
 
     scrollToOffset(offset, time?) {
         let _time = time || 0
         this.scrollView.scrollToOffset(offset, _time);
         this.update(this.updateInterval)
     }
 
     initItemByData(item, data) {
         if (this._itemCtrlFunc) {
             this._itemCtrlFunc(item, data)
             return
         }
 
         let com = item.getComponent(item.name)
         if (com) {
             com.initItem(data);
         }
     }
 
     onDestroy() {
         if (this.nodePool) {
             this.nodePool.clear();
             this.nodePool = null;
         }
     }
 }