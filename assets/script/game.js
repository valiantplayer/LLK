
cc.Class({
    extends: cc.Component,

    properties: {
        layerStart: {
            type: cc.Node,
            default: null
        },
        layerGame: {
            type: cc.Node,
            default: null
        },
        layerOver: {
            type: cc.Node,
            default: null
        },
        layerZanTing: {
            type: cc.Node,
            default: null
        },
        layerLevels: {
            type: cc.Node,
            default: null
        },
        nodeParent: {
            type: cc.Node,
            default: null
        },
        nodeParent_xian: {
            type: cc.Node,
            default: null
        },
        pre_block: {
            type: cc.Prefab,
            default: null
        },
        pre_xian: {
            type: cc.Prefab,
            default: null
        },
        pre_level: {
            type: cc.Prefab,
            default: null
        },
        node_zhaDan: {
            type: cc.Node,
            default: null
        },
        progressBar: {//进度条
            type: cc.ProgressBar,
            default: null
        },
        arrAudio: {
            type: [cc.AudioClip],
            default: []
        }
    },

    onLoad() {

        window.game = this

        var fbl_sheBei = cc.director.getWinSizeInPixels();
        console.log(fbl_sheBei.width + "+" + fbl_sheBei.height);
        this.can_music = true;
        this.can_eff = true;
        this.bgMusic = cc.audioEngine.play(this.arrAudio[0], true, 1)

        this.shuaXinBtn_sound();
        //适配多种设备
        {
            var f_scale = fbl_sheBei.width / 720.0
            this.layerStart.getChildByName('title').scale = f_scale
            this.layerGame.getChildByName('node_top').scale = f_scale
            this.layerZanTing.getChildByName('bg').scale = f_scale
            this.layerLevels.getChildByName('pageView').scale = f_scale
            this.layerOver.getChildByName('bg').scale = f_scale
            this.layerOver.getChildByName('bg_success').scale = f_scale
            this.nodeParent.scale = f_scale
            this.nodeParent_xian.scale = f_scale
        }

        this.layerStart.active = true
        this.layerGame.active = false
        this.layerOver.active = false
        this.layerZanTing.active = false
        this.layerLevels.active = false

        this.gameType = 0//游戏状态（0：准备游戏 1：游戏中 2:游戏结束_失败 3:游戏结束_成功 4:游戏暂停）
        // this.numLevel = 1 //当前关卡
        // this.numLevelBest = 23//玩到的最高关卡

        this.numLevelBest = cc.sys.localStorage.getItem('numLevelBest');
        // this.numLevelBest = 50//玩到的最高关卡
        if (!this.numLevelBest) {
            this.numLevelBest = 1;
        }
        this.numLevel = this.numLevelBest;

        this.addLevels()
        this.setTouch()
    },

    //开始游戏
    gamePlay: function () {
        this.layerStart.active = false
        this.layerGame.active = true
        this.layerOver.active = false
        this.layerZanTing.active = false
        this.layerLevels.active = false
        this.nodeParent.active = true;

        var levelInfoLength = gameDate.levelInfo.length;
        if (levelInfoLength <= this.numLevel) {
            this.numLevel = levelInfoLength - 1
        }

        this.gameType = 1

        this.numScore = 0 //当前的分数
        this.layerGame.getChildByName('node_top').getChildByName('label_score').getComponent(cc.Label).string = this.numScore
        this.layerGame.getChildByName('node_top').getChildByName('label_level').getComponent(cc.Label).string = '第' + this.numLevel + '关'
        this.isZhaDan = false//是否使用炸弹道具
        this.canMove = gameDate.levelInfo[this.numLevel].canMove//是否可以移动
        this.i_moveDir = 0//移动数组的角标
        this.isMoving = false//所有块正在移动中
        this.progressBar.progress = 1.0
        this.gameTime = gameDate.levelInfo[this.numLevel].gameTime //该关卡所需要的时间

        this.block_wh = 89 //元素的宽高
        this.gameW = gameDate.levelInfo[this.numLevel].w //宽的个数
        this.gameH = gameDate.levelInfo[this.numLevel].h //高的个数

        this.i_touchBlock = -1//选中的是哪个块

        this.arr_block = []
        for (let i = 0; i < this.gameH + 2; i++) {
            this.arr_block[i] = []
        }

        this.nodeParent.width = (this.gameW + 2) * this.block_wh
        this.nodeParent.height = (this.gameH + 2) * this.block_wh

        this.nodeParent_xian.width = (this.gameW + 2) * this.block_wh
        this.nodeParent_xian.height = (this.gameH + 2) * this.block_wh

        this.arrXian = [] //连线的点

        this.nodeParent.removeAllChildren()
        this.createBlocks()

        //this.addXian(cc.v2(6,1),cc.v2(1,1))
        this.shuaXinBlocks()
        this.shuaXinArrBlodk()
        this.shuaXin_ziDong()
        this.logArrBlock()
    },

    setTouch: function () {
        this.nodeParent.on('touchstart', function (event) {
            if (this.isMoving) {
                return
            }

            var pos1 = event.getLocation()
            var p_start = this.nodeParent.convertToNodeSpaceAR(pos1)
            console.log('touchStart_x:' + p_start.x + ',touchStart_y:' + p_start.y);

            var children = this.nodeParent.children
            for (let i = 0; i < children.length; i++) {
                var rect_block = children[i].getBoundingBox()
                if (rect_block.contains(p_start)) {
                    this.allBlockNoClick()
                    if (this.can_eff) {
                        cc.audioEngine.play(this.arrAudio[5], false, 1)
                    }


                    if (this.isZhaDan) {
                        if (this.can_eff) {
                            cc.audioEngine.play(this.arrAudio[1], false, 1)
                        }
                        var js_block = children[i].getComponent('block')
                        var remove_iType = js_block.i_type
                        var children_j = this.nodeParent.children

                        for (let j = children_j.length - 1; j >= 0; j--) {
                            var js_block_j = children_j[j].getComponent('block')
                            var remove_iType_j = js_block_j.i_type
                            if (remove_iType == remove_iType_j) {
                                this.removeBlockById(j)
                            }
                        }

                        this.isZhaDan = false
                        this.node_zhaDan.stopAllActions()
                        this.node_zhaDan.scale = 1
                        this.pdSuccess()

                        this.shuaXinArrBlodk()

                        if (this.canMove) {
                            this.scheduleOnce(function () {
                                this.moveBlocks()
                            }, 0.2)
                        } else {
                            this.shuaXin_ziDong()
                        }

                        return
                    }

                    if (this.i_touchBlock == -1) {//一个也没选中
                        this.i_touchBlock = i
                    } else {
                        if (this.i_touchBlock != i) {

                            var pos_shangCi = children[this.i_touchBlock].getPosition()
                            var pos_shangCi_arr = this.getArrByPosition(pos_shangCi)

                            var pos_benCi = children[i].getPosition()
                            var pos_benCi_arr = this.getArrByPosition(pos_benCi)

                            this.arrXian = []
                            this.arrXian.push(pos_shangCi_arr)
                            this.arrXian.push(pos_benCi_arr)

                            if (this.pdLianXian(pos_shangCi_arr, pos_benCi_arr)) {
                                console.log('可以消除');

                                if (this.can_eff) {
                                    cc.audioEngine.play(this.arrAudio[3], false, 1)
                                }
                                this.getScore = 0
                                {//连线操作
                                    var i_sizeXian = this.arrXian.length
                                    if (i_sizeXian == 2) {
                                        this.addXian(this.arrXian[0], this.arrXian[1])
                                    } else if (i_sizeXian == 3) {
                                        this.getScore = this.getScore - 1
                                        this.addXian(this.arrXian[0], this.arrXian[2])
                                        this.addXian(this.arrXian[1], this.arrXian[2])
                                    } else if (i_sizeXian == 4) {
                                        this.getScore = this.getScore - 2
                                        if (this.arrXian[0].x == this.arrXian[2].x || this.arrXian[0].y == this.arrXian[2].y) {
                                            this.addXian(this.arrXian[0], this.arrXian[2])
                                            this.addXian(this.arrXian[1], this.arrXian[3])
                                            this.addXian(this.arrXian[2], this.arrXian[3])
                                        } else {
                                            this.addXian(this.arrXian[0], this.arrXian[3])
                                            this.addXian(this.arrXian[1], this.arrXian[2])
                                            this.addXian(this.arrXian[2], this.arrXian[3])
                                        }
                                    } else {
                                        console.log('有多少个点：' + i_sizeXian);
                                    }
                                }

                                if (i > this.i_touchBlock) {
                                    this.removeBlockById(i)
                                    this.removeBlockById(this.i_touchBlock)
                                } else {
                                    this.removeBlockById(this.i_touchBlock)
                                    this.removeBlockById(i)
                                }

                                var score_zong = this.getScore * 10
                                this.numScore = this.numScore + score_zong
                                this.layerGame.getChildByName('node_top').getChildByName('label_score').getComponent(cc.Label).string = this.numScore

                                this.i_touchBlock = -1
                                this.shuaXinArrBlodk()
                                this.pdSuccess()

                                if (this.canMove) {
                                    this.scheduleOnce(function () {
                                        this.moveBlocks()
                                    }, 0.2)
                                } else {
                                    this.shuaXin_ziDong()
                                }

                                return
                            } else {
                                console.log('不可以消除');
                            }

                        }

                    }

                    this.i_touchBlock = i
                    console.log('选中了:' + i);
                    var js_block = children[i].getComponent('block')
                    js_block.setClick(true)

                }
            }
        }, this);
    },

    //移动所有的块
    moveBlocks: function () {
        this.isMoving = true
        var i_arrMoveLength = gameDate.levelInfo[this.numLevel].arrMove.length
        var i_dir = gameDate.levelInfo[this.numLevel].arrMove[this.i_moveDir]//0:上 1：下 2：左 3：右
        this.i_moveDir++
        if (this.i_moveDir >= i_arrMoveLength) {
            this.i_moveDir = 0
        }
        this.logArrBlock()
        var f_time_1 = 0.1 //移动一个块的位置所需要的时间
        var f_time_big = 0.01 //最长所需要的时间
        var children = this.nodeParent.children
        for (let i = 0; i < children.length; i++) {
            var pos_1 = children[i].getPosition()
            var pos_arr_1 = this.getArrByPosition(pos_1)

            if (i_dir == 0) {//向上
                var i_null = -1
                for (let m = 0; m < this.gameH + 2; m++) {
                    for (let n = 0; n < this.gameW + 2; n++) {
                        if (pos_arr_1.y == n && m > pos_arr_1.x) {
                            if (this.arr_block[m][n] == 0) {
                                i_null++
                            }
                        }
                    }
                }
                if (f_time_big < f_time_1 * i_null) {
                    f_time_big = f_time_1 * i_null
                }
                var act_1 = cc.moveBy(f_time_1 * i_null, cc.v2(0, i_null * this.block_wh))
                children[i].runAction(act_1)
            } else if (i_dir == 1) {//下
                var i_null = -1
                for (let m = 0; m < this.gameH + 2; m++) {
                    for (let n = 0; n < this.gameW + 2; n++) {
                        if (pos_arr_1.y == n && m < pos_arr_1.x) {
                            if (this.arr_block[m][n] == 0) {
                                i_null++
                            }
                        }
                    }
                }
                if (f_time_big < f_time_1 * i_null) {
                    f_time_big = f_time_1 * i_null
                }
                var act_1 = cc.moveBy(f_time_1 * i_null, cc.v2(0, -i_null * this.block_wh))
                children[i].runAction(act_1)
            } else if (i_dir == 3) {//右
                var i_null = -1
                for (let m = 0; m < this.gameH + 2; m++) {
                    for (let n = 0; n < this.gameW + 2; n++) {
                        if (pos_arr_1.x == m && n > pos_arr_1.y) {
                            if (this.arr_block[m][n] == 0) {
                                i_null++
                            }
                        }
                    }
                }
                if (f_time_big < f_time_1 * i_null) {
                    f_time_big = f_time_1 * i_null
                }
                var act_1 = cc.moveBy(f_time_1 * i_null, cc.v2(i_null * this.block_wh, 0))
                children[i].runAction(act_1)
            } else if (i_dir == 2) {//左
                var i_null = -1
                for (let m = 0; m < this.gameH + 2; m++) {
                    for (let n = 0; n < this.gameW + 2; n++) {
                        if (pos_arr_1.x == m && n < pos_arr_1.y) {
                            if (this.arr_block[m][n] == 0) {
                                i_null++
                            }
                        }
                    }
                }
                if (f_time_big < f_time_1 * i_null) {
                    f_time_big = f_time_1 * i_null
                }
                var act_1 = cc.moveBy(f_time_1 * i_null, cc.v2(-i_null * this.block_wh, 0))
                children[i].runAction(act_1)
            }


        }

        this.scheduleOnce(function () {
            this.isMoving = false
            this.shuaXinArrBlodk()
            console.log('*********************************************');
            this.logArrBlock()
            this.shuaXin_ziDong()
        }, f_time_big + 0.05);
    },

    //通过id来删除该元素块
    removeBlockById: function (_id) {
        var children = this.nodeParent.children
        children[_id].removeFromParent()
    },

    //所有的元素都未选中
    allBlockNoClick: function () {
        var children = this.nodeParent.children
        for (let i = 0; i < children.length; i++) {
            var js_block = children[i].getComponent('block')
            if (js_block) {
                js_block.setClick(false)
            }
        }
    },

    //添加所有关卡
    addLevels: function () {
        var node_content = this.layerLevels.getChildByName('pageView').getChildByName('view').getChildByName('content')
        var children = node_content.children
        var i_numLevel = 0
        var f_jianGe = 40

        for (let k = 0; k < children.length; k++) {
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 4; j++) {//每行添加4个
                    i_numLevel++
                    var item_level = cc.instantiate(this.pre_level)
                    item_level.parent = children[k]
                    item_level.setPosition(cc.v2(-(f_jianGe / 2 * 3 + 114 / 2 * 3) + (114 + f_jianGe) * j, 350 - 150 * i))
                    var js_level = item_level.getComponent('itemLevel')
                    js_level.init(i_numLevel)
                }
            }
        }
    },

    //刷新所有的关卡
    shuaXinLevels: function () {
        var pageView = this.layerLevels.getChildByName('pageView').getComponent(cc.PageView)
        var node_content = this.layerLevels.getChildByName('pageView').getChildByName('view').getChildByName('content')
        var children_page = node_content.children
        for (let i = 0; i < children_page.length; i++) {
            var children_level = children_page[i].children
            for (let j = 0; j < children_level.length; j++) {
                var js_level = children_level[j].getComponent('itemLevel')
                var item_num = js_level.num_level
                if (item_num <= this.numLevelBest) {//可以玩
                    js_level.canPlay(true)
                } else {//不可以玩
                    js_level.canPlay(false)
                }
            }
        }
        pageView.scrollToPage(Math.floor(this.numLevelBest / 24.001), 0.001)
    },

    //创建水果元素
    createBlocks: function () {
        var i_createNum = 0
        var i_ranmNum = 0

        for (let i = 0; i < this.gameH + 2; i++) {
            for (let j = 0; j < this.gameW + 2; j++) {

                if (i == 0 || i == this.gameH + 1) {
                    continue
                }

                if (j == 0 || j == this.gameW + 1) {
                    continue
                }

                var block = cc.instantiate(this.pre_block)//实例化出block
                block.parent = this.nodeParent
                block.setPosition(cc.v2(-this.nodeParent.width / 2 + j * this.block_wh + this.block_wh / 2, -this.nodeParent.height / 2 + i * this.block_wh + this.block_wh / 2))

                if (i_createNum % 2 == 0) {
                    i_ranmNum = Math.floor(Math.random() * 44) + 1//1-44
                }
                i_createNum++

                var js_block = block.getComponent('block')
                js_block.createYuanSu(i_ranmNum)
            }
        }
    },

    //创建连接线
    addXian: function (p_1, p_2) {
        var i_1 = p_1.x
        var j_1 = p_1.y
        var i_2 = p_2.x
        var j_2 = p_2.y

        var node_xian = cc.instantiate(this.pre_xian)//实例化出连接线
        node_xian.parent = this.nodeParent_xian

        var act_1 = cc.delayTime(0.3)
        var act_2 = cc.callFunc(function () {
            node_xian.removeFromParent()
        })
        var end = cc.sequence(act_1, act_2)
        node_xian.runAction(end)

        //node_xian.setPosition(this.getPosByArr(cc.v2(i_1,j_1)))

        if (i_1 == i_2) {//横线
            var j_min = j_1
            var j_max = j_1
            if (j_2 < j_min) {
                j_min = j_2
            }
            if (j_2 > j_max) {
                j_max = j_2
            }

            node_xian.setPosition(this.getPosByArr(cc.v2(i_1, j_min)))
            node_xian.anchorX = 0
            node_xian.anchorY = 0.5
            node_xian.width = (j_max - j_min) * this.block_wh
            this.getScore = this.getScore + j_max - j_min + 1
            node_xian.height = 5
        }

        if (j_1 == j_2) {//竖线
            var i_min = i_1
            var i_max = i_1
            if (i_2 < i_min) {
                i_min = i_2
            }
            if (i_2 > i_max) {
                i_max = i_2
            }

            node_xian.setPosition(this.getPosByArr(cc.v2(i_min, j_1)))
            node_xian.anchorX = 0.5
            node_xian.anchorY = 0
            node_xian.width = 5
            node_xian.height = (i_max - i_min) * this.block_wh
            this.getScore = this.getScore + i_max - i_min + 1
        }


    },

    //刷新所有的元素块
    shuaXinBlocks: function () {
        var children = this.nodeParent.children
        for (let i = 0; i < children.length; i++) {
            var js_block = children[i].getComponent('block')
            if (js_block) {
                var pos_1 = children[i].getPosition()
                var i_randomChild = Math.floor((Math.random() * children.length))
                var pos_2 = children[i_randomChild].getPosition()

                children[i].setPosition(pos_2)
                children[i_randomChild].setPosition(pos_1)
            }
        }
    },

    //判断是否成功
    pdSuccess: function () {
        var children = this.nodeParent.children
        if (children == 0) {
            if (this.numLevel >= this.numLevelBest) {
                this.numLevelBest++;
                cc.sys.localStorage.setItem('numLevelBest', this.numLevelBest)
            }

            console.log('过关了');
            if (this.can_eff) {
                cc.audioEngine.play(this.arrAudio[6], false, 1)
            }

            this.layerOver.active = true
            this.layerOver.getChildByName('bg').active = false
            this.layerOver.getChildByName('bg_success').active = true

            this.gameType = 3
            this.layerOver.getChildByName('bg_success').getChildByName('label_level').getComponent(cc.Label).string = this.numLevel
            this.layerOver.getChildByName('bg_success').getChildByName('label_score_curr').getComponent(cc.Label).string = '当前分数：' + this.numScore

            var bestScore = cc.sys.localStorage.getItem('bestScore_llk')
            if (!bestScore) {
                bestScore = 0
            }
            if (bestScore < this.numScore) {
                bestScore = this.numScore
            }
            cc.sys.localStorage.setItem('bestScore_llk', bestScore)
            this.layerOver.getChildByName('bg_success').getChildByName('label_score_best').getComponent(cc.Label).string = '最高分数：' + bestScore

        }
    },

    //判断是否需要刷新
    pdShuaXin: function () {
        var children = this.nodeParent.children
        for (let i = 0; i < children.length; i++) {
            for (let j = 0; j < children.length; j++) {
                if (i == j) {
                    continue
                }
                var pos_1 = children[i].getPosition()
                var pos_1_arr = this.getArrByPosition(pos_1)

                var pos_2 = children[j].getPosition()
                var pos_2_arr = this.getArrByPosition(pos_2)

                if (this.pdLianXian(pos_1_arr, pos_2_arr)) {
                    return false
                }
            }
        }
        if (children.length == 0) {
            return false
        }
        return true
    },

    //自动刷新
    shuaXin_ziDong: function () {
        while (true) {
            if (this.pdShuaXin()) {
                this.shuaXinBlocks()
                this.shuaXinArrBlodk()
            } else {
                break
            }
        }
    },

    //提示
    tiShi: function () {
        var children = this.nodeParent.children
        for (let i = 0; i < children.length; i++) {
            for (let j = 0; j < children.length; j++) {
                if (i == j) {
                    continue
                }

                var pos_1 = children[i].getPosition()
                var pos_1_arr = this.getArrByPosition(pos_1)

                var pos_2 = children[j].getPosition()
                var pos_2_arr = this.getArrByPosition(pos_2)

                if (this.pdLianXian(pos_1_arr, pos_2_arr)) {
                    {
                        var act_1 = cc.scaleTo(0.15, 0.8)
                        var act_2 = cc.scaleTo(0.15, 1)
                        var act_3 = cc.sequence(act_1, act_2)
                        var act_4 = cc.repeat(act_3, 2)

                        children[i].runAction(act_4)
                    }
                    {
                        var act_1 = cc.scaleTo(0.15, 0.8)
                        var act_2 = cc.scaleTo(0.15, 1)
                        var act_3 = cc.scaleTo(0.15, 0.8)
                        var act_4 = cc.scaleTo(0.15, 1)
                        var end = cc.sequence(act_1, act_2, act_3, act_4)
                        children[j].runAction(end)
                    }
                    return
                }
            }
        }
    },
    shuaXinBtn_sound() {
        if (this.can_music) {
            this.layerZanTing.getChildByName('bg').getChildByName('sp_1').getChildByName('btn_music_off_zanTing').active = false
            this.layerZanTing.getChildByName('bg').getChildByName('sp_1').getChildByName('btn_music_on_zanTing').active = true
        } else {
            this.layerZanTing.getChildByName('bg').getChildByName('sp_1').getChildByName('btn_music_off_zanTing').active = true
            this.layerZanTing.getChildByName('bg').getChildByName('sp_1').getChildByName('btn_music_on_zanTing').active = false
        }
        if (this.can_eff) {
            this.layerZanTing.getChildByName('bg').getChildByName('sp_1').getChildByName('btn_eff_off_zanTing').active = false
            this.layerZanTing.getChildByName('bg').getChildByName('sp_1').getChildByName('btn_eff_on_zanTing').active = true
        } else {
            this.layerZanTing.getChildByName('bg').getChildByName('sp_1').getChildByName('btn_eff_off_zanTing').active = true
            this.layerZanTing.getChildByName('bg').getChildByName('sp_1').getChildByName('btn_eff_on_zanTing').active = false
        }
    }
    ,


    btn_callBack: function (sender, str) {
        if (this.can_eff) {
            cc.audioEngine.play(this.arrAudio[2], false, 1)
        }
        if (str == 'btn_play') {
            console.log('点击了按钮1');
            this.layerStart.active = false
            this.layerGame.active = true

            this.gamePlay()

        } else if (str == 'btn_shuaXin') {
            if (this.isMoving) {
                return
            }
            this.shuaXinBlocks()
            this.shuaXinArrBlodk()
            this.shuaXin_ziDong()
            this.logArrBlock()
        } else if (str == 'btn_tiShi') {
            if (this.isMoving) {
                return
            }
            this.tiShi()
        } else if (str == 'btn_zhaDan') {
            if (this.isZhaDan) {
                return
            }
            if (this.isMoving) {
                return
            }
            this.isZhaDan = true
            var act_1 = cc.scaleTo(0.2, 1.1)
            var act_2 = cc.scaleTo(0.4, 0.9)
            var act_3 = cc.scaleTo(0.2, 1)
            var act_4 = cc.sequence(act_1, act_2, act_3)
            var end = cc.repeatForever(act_4)
            this.node_zhaDan.runAction(end)
        } else if (str == 'btn_rePlay_over') {
            this.gamePlay()
        } else if (str == 'btn_rePlay_success') {
            this.gamePlay()
        } else if (str == 'btn_next_success') {
            this.numLevel++
            this.gamePlay()
        } else if (str == 'btn_zanTing') {
            this.gameType = 4
            this.layerZanTing.active = true
            this.nodeParent.active = false;
        } else if (str == 'btn_play_zanTing') {
            this.gameType = 1
            this.layerZanTing.active = false
            this.nodeParent.active = true;
        } else if (str == 'btn_rePlay_zanTing') {
            this.layerZanTing.active = false
            this.gamePlay()
        } else if (str == 'btn_back_levels') {
            this.layerStart.active = true
            this.layerGame.active = false
            this.layerOver.active = false
            this.layerZanTing.active = false
            this.layerLevels.active = false
        } else if (str == 'btn_level_success' || str == 'btn_level_over' || str == 'btn_level_zanTing') {
            this.layerLevels.active = true
            this.layerStart.active = false
            this.layerGame.active = false
            this.layerOver.active = false
            this.layerZanTing.active = false
            this.shuaXinLevels()
        } else if (str == 'btn_music_off_zanTing') {
            cc.audioEngine.stop(this.arrAudio[0])
            this.bgMusic = cc.audioEngine.play(this.arrAudio[0], true, 1)
            this.can_music = !this.can_music
            this.shuaXinBtn_sound()
        } else if (str == 'btn_music_on_zanTing') {
            cc.audioEngine.stop(this.bgMusic)
            this.can_music = !this.can_music
            this.shuaXinBtn_sound()
        } else if (str == 'btn_eff_off_zanTing') {
            this.can_eff = !this.can_eff
            this.shuaXinBtn_sound()
        } else if (str == 'btn_eff_on_zanTing') {
            this.can_eff = !this.can_eff
            this.shuaXinBtn_sound()
        }

    },

    update(dt) {//大概每秒执行60次

        if (this.gameType == 1) {
            this.gameTime--
            this.progressBar.progress = this.gameTime / gameDate.levelInfo[this.numLevel].gameTime
            if (this.gameTime <= 0) {
                cc.audioEngine.play(this.arrAudio[4], false, 1)
                this.layerOver.active = true
                this.layerOver.getChildByName('bg').active = true
                this.layerOver.getChildByName('bg_success').active = false
                this.gameType = 2
                this.layerOver.getChildByName('bg').getChildByName('label_level').getComponent(cc.Label).string = this.numLevel
                console.log('游戏结束');
            }
        }


        //console.log(this.gameTime / gameDate.levelInfo[1].gameTime);
    },

    //通过坐标得到二维数组的角标
    getArrByPosition: function (_pos_block) {

        var pos_block = cc.v2(_pos_block.x, _pos_block.y)
        pos_block.x = this.nodeParent.width / 2 + pos_block.x
        pos_block.y = this.nodeParent.height / 2 + pos_block.y

        var ii = Math.floor(pos_block.y / this.block_wh)
        var jj = Math.floor(pos_block.x / this.block_wh)

        return cc.v2(ii, jj)
    },

    //通过二维数组的角标得到位置坐标
    getPosByArr: function (_p_arr) {

        var p_arr = cc.v2(_p_arr.x, _p_arr.y)

        var pos_block = cc.v2(-this.nodeParent.width / 2 + p_arr.y * this.block_wh + this.block_wh / 2,
            -this.nodeParent.height / 2 + p_arr.x * this.block_wh + this.block_wh / 2)

        return pos_block
    },

    //刷新二维数组
    shuaXinArrBlodk: function () {
        for (let i = 0; i < this.gameH + 2; i++) {
            for (let j = 0; j < this.gameW + 2; j++) {
                this.arr_block[i][j] = 0
            }
        }

        var children = this.nodeParent.children
        for (let i = 0; i < children.length; i++) {

            var pos_block = children[i].getPosition()

            var ii = this.getArrByPosition(pos_block).x
            var jj = this.getArrByPosition(pos_block).y

            // console.log('x:'+pos_block.x+' y:' +pos_block.y);
            // console.log('ii:'+ii+' jj:' +jj);
            var js_block = children[i].getComponent('block')
            // console.log('i_type:'+js_block.i_type);
            this.arr_block[ii][jj] = js_block.i_type
        }

    },

    //判断是否可以连线
    pdLianXian: function (p_1, p_2) {
        if (this.xian_1(p_1, p_2)) {
            return true
        }

        if (this.xian_2(p_1, p_2)) {
            return true
        }

        if (this.xian_3(p_1, p_2)) {
            return true
        }

        return false
    },

    //一条直线
    xian_1: function (p_1, p_2) {
        var i_1 = p_1.x
        var j_1 = p_1.y
        var i_2 = p_2.x
        var j_2 = p_2.y

        if (this.arr_block[i_1][j_1] != this.arr_block[i_2][j_2]) {
            return false
        }

        if (i_1 == i_2) {//横线
            var j_min = j_1
            var j_max = j_1
            if (j_2 < j_min) {
                j_min = j_2
            }
            if (j_2 > j_max) {
                j_max = j_2
            }

            for (let j = j_min + 1; j < j_max; j++) {
                if (this.arr_block[i_1][j] != 0) {
                    return false
                }
            }

            {
                var have_P1 = false
                var have_P2 = false
                for (let i = 0; i < this.arrXian.length; i++) {
                    if (this.arrXian[i].x == p_1.x && this.arrXian[i].y == p_1.y) {
                        have_P1 = true
                    }

                    if (this.arrXian[i].x == p_2.x && this.arrXian[i].y == p_2.y) {
                        have_P2 = true
                    }
                }

                if (!have_P1) {
                    this.arrXian.push(p_1)
                }

                if (!have_P2) {
                    this.arrXian.push(p_2)
                }
            }


            return true
        }

        if (j_1 == j_2) {//竖线
            var i_min = i_1
            var i_max = i_1
            if (i_2 < i_min) {
                i_min = i_2
            }
            if (i_2 > i_max) {
                i_max = i_2
            }

            for (let i = i_min + 1; i < i_max; i++) {
                if (this.arr_block[i][j_1] != 0) {
                    return false
                }
            }


            {
                var have_P1 = false
                var have_P2 = false
                for (let i = 0; i < this.arrXian.length; i++) {
                    if (this.arrXian[i].x == p_1.x && this.arrXian[i].y == p_1.y) {
                        have_P1 = true
                    }

                    if (this.arrXian[i].x == p_2.x && this.arrXian[i].y == p_2.y) {
                        have_P2 = true
                    }
                }

                if (!have_P1) {
                    this.arrXian.push(p_1)
                }

                if (!have_P2) {
                    this.arrXian.push(p_2)
                }
            }


            return true
        }

        return false
    },

    //一个转弯
    xian_2: function (p_1, p_2) {
        var i_1 = p_1.x
        var j_1 = p_1.y
        var i_2 = p_2.x
        var j_2 = p_2.y

        for (let i = this.arrXian.length - 1; i > 1; i--) {
            this.arrXian.splice(i, 1);
        }

        if (this.arr_block[i_1][j_1] != this.arr_block[i_2][j_2]) {
            return false
        }

        if (this.arr_block[i_2][j_1] == 0) {
            this.arr_block[i_2][j_1] = this.arr_block[i_1][j_1]
            if (this.xian_1(cc.v2(i_2, j_1), p_1) && this.xian_1(cc.v2(i_2, j_1), p_2)) {
                this.arr_block[i_2][j_1] = 0
                return true
            }
            this.arr_block[i_2][j_1] = 0
        }

        for (let i = this.arrXian.length - 1; i > 1; i--) {
            this.arrXian.splice(i, 1);
        }

        if (this.arr_block[i_1][j_2] == 0) {
            this.arr_block[i_1][j_2] = this.arr_block[i_1][j_1]
            if (this.xian_1(cc.v2(i_1, j_2), p_1) && this.xian_1(cc.v2(i_1, j_2), p_2)) {
                this.arr_block[i_1][j_2] = 0
                return true
            }
            this.arr_block[i_1][j_2] = 0
        }

        for (let i = this.arrXian.length - 1; i > 1; i--) {
            this.arrXian.splice(i, 1);
        }

        return false
    },

    //两个转弯
    xian_3: function (p_1, p_2) {
        var i_1 = p_1.x
        var j_1 = p_1.y
        var i_2 = p_2.x
        var j_2 = p_2.y

        if (this.arr_block[i_1][j_1] != this.arr_block[i_2][j_2]) {
            return false
        }

        var i_now = i_1
        while (true) {//向下延伸
            i_now--
            if (i_now < 0) {
                break
            }
            if (this.arr_block[i_now][j_1] != 0) {
                break
            }

            this.arr_block[i_now][j_1] = this.arr_block[i_1][j_1]
            if (this.xian_2(cc.v2(i_now, j_1), p_2)) {
                this.arr_block[i_now][j_1] = 0
                return true
            }
            this.arr_block[i_now][j_1] = 0
        }

        var i_now = i_1
        while (true) {//向上延伸
            i_now++
            if (i_now > this.gameH + 1) {
                break
            }
            if (this.arr_block[i_now][j_1] != 0) {
                break
            }

            this.arr_block[i_now][j_1] = this.arr_block[i_1][j_1]
            if (this.xian_2(cc.v2(i_now, j_1), p_2)) {
                this.arr_block[i_now][j_1] = 0
                return true
            }
            this.arr_block[i_now][j_1] = 0
        }

        var j_now = j_1
        while (true) {//向左延伸
            j_now--
            if (j_now < 0) {
                break
            }
            if (this.arr_block[i_1][j_now] != 0) {
                break
            }

            this.arr_block[i_1][j_now] = this.arr_block[i_1][j_1]
            if (this.xian_2(cc.v2(i_1, j_now), p_2)) {
                this.arr_block[i_1][j_now] = 0
                return true
            }
            this.arr_block[i_1][j_now] = 0
        }

        var j_now = j_1
        while (true) {//向右延伸
            j_now++
            if (j_now > this.gameW + 1) {
                break
            }
            if (this.arr_block[i_1][j_now] != 0) {
                break
            }

            this.arr_block[i_1][j_now] = this.arr_block[i_1][j_1]
            if (this.xian_2(cc.v2(i_1, j_now), p_2)) {
                this.arr_block[i_1][j_now] = 0
                return true
            }
            this.arr_block[i_1][j_now] = 0
        }
    },

    //输出二维数组
    logArrBlock: function () {

        for (let i = this.gameH + 1; i >= 0; i--) {
            console.log(this.arr_block[i]);
        }
    }
});
