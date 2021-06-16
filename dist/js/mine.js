"use strict";var gameover=!1,firstclick=!0,leftClick=!1,rightClick=!1,left_count=0,right_count=0,double_count=0,ces_count=0,right_invalid=!1,left_invalid=!1,middle_invalid=!1,leftClickWithShift=!1,video_invalid=!0,reset_begin=!1,path=0,question=!1;function Container(t,e,n){this.rows=t,this.columns=e,this.bombNumber=n,this.childObject=[],this.html=null,this.minenumber=n,this.level=1}function Direction(){this.up=null,this.right=null,this.down=null,this.left=null,this.leftUp=null,this.rightUp=null,this.leftDown=null,this.rightDown=null}function Block(t,e){this.neighbors=new Direction,this.root=null,this.isBomb=!1,this.bombNumAround=-1,this.className=t,this.id=e,this.isOpen=!1,this.is_bv=!0,this.init()}Container.prototype.init=function(t,e,n,i){reset(),gameover=!1,firstclick=!0,leftClick=!1,rightClick=!1,left_invalid=!1,right_invalid=!1,middle_invalid=!1,leftClickWithShift=!1,left_count=0,right_count=0,double_count=0,ces_count=0,path=0;const o=document.getElementById("container");if(0!==window.orientation&&180!==window.orientation||3!==t&&(0!==t||3!==this.level)?document.getElementsByTagName("meta")[1].content="width=device-width, initial-scale=1, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0":document.getElementsByTagName("meta")[1].content="width=device-width, initial-scale=1, user-scalable=no, minimum-scale="+window.screen.width/640+", maximum-scale="+window.screen.width/640,o){document.getElementById("mouse_point")&&$("div#mouse_point").remove(),document.getElementById("video_control").style.display="none";const s=document.getElementById("containers");for(let t=0;t<this.rows*this.columns;t++)o.removeChild(o.childNodes[0]);if(4===t?(this.rows=n,this.columns=e,this.bombNumber=i,this.level=4):3===t?(this.rows=16,this.columns=30,this.bombNumber=99,this.level=3):2===t?(this.rows=16,this.columns=16,this.bombNumber=40,this.level=2):1===t&&(this.rows=8,this.columns=8,this.bombNumber=10,this.level=1),0!==t){const t=16;o.setAttribute("style",`width:${t*this.columns}px;height:${t*this.rows}px;`),s.setAttribute("style",`width:${18+t*this.columns}px;height:${106+t*this.rows}px;`),$("#top").css("width",2+t*this.columns),$("#mine").css("width",156+t*this.columns),$("#menu").css("width",18+t*this.columns),$("#mark").css("width",6+t*this.columns),$("#mark_span").css("width",6+t*this.columns);const e=$("#border"),n=$("#video_control"),i=e.outerWidth(),l=n.outerWidth()+parseInt(e.css("padding-left"))+parseInt(e.css("padding-right"));let h=0;$("#containers").outerWidth()>n.outerWidth()?h=$("#counters").outerWidth()+6:i>l&&(h=(i-l)/2),n.css({"margin-top":e.outerHeight()-2,"margin-left":h,left:4})}this.childObject.splice(0,this.childObject.length);for(let t=0;t<this.rows*this.columns;t++){const e=new Block("block",t);this.childObject.push(e),o.appendChild(e.root)}window.parent.document.getElementById("video-iframe").width=document.getElementById("border").offsetWidth,window.parent.document.getElementById("video-iframe").height=document.getElementById("border").offsetHeight,window.parent.document.getElementById("video-stage").style.display="block"}else{this.html=document.createElement("div"),this.html.id="container";for(let t=0;t<this.rows*this.columns;t++){const e=new Block("block",t);this.childObject.push(e),this.html.appendChild(e.root)}}changeFaceClass("face_normal"),changeTopCount("mine_count",this.bombNumber),changeTopCount("time_count",0),this.minenumber=this.bombNumber},Container.prototype.add_mark=function(){const t=document.createElement("div");t.id="mark",document.getElementById("containers").appendChild(t);const e=document.createElement("span");e.id="mark_span",e.innerHTML="Anonymous!",document.getElementById("mark").appendChild(e)},Container.prototype.setMine=function(t){reset(),log("新游戏布雷，bombId = "+t),gameover=!1,leftClick=!1,rightClick=!1;let e=0;for(;!(e>=this.bombNumber);){const n=Math.floor(Math.random()*this.rows*this.columns);n!==t&&!0!==this.childObject[n].isBomb&&(this.childObject[n].isBomb=!0,e++)}for(let t=0;t<this.rows*this.columns;t++){const e=this.childObject[t];e.neighbors.up=this.childObject[t-this.columns],e.neighbors.right=this.childObject[t+1],e.neighbors.down=this.childObject[t+this.columns],e.neighbors.left=this.childObject[t-1],e.neighbors.leftUp=this.childObject[t-this.columns-1],e.neighbors.rightUp=this.childObject[t-this.columns+1],e.neighbors.leftDown=this.childObject[t+this.columns-1],e.neighbors.rightDown=this.childObject[t+this.columns+1],t/this.columns==0?(e.neighbors.up=null,e.neighbors.leftUp=null,e.neighbors.rightUp=null):t/this.columns==this.rows-1&&(e.neighbors.down=null,e.neighbors.leftDown=null,e.neighbors.rightDown=null),t%this.columns==0?(e.neighbors.left=null,e.neighbors.leftUp=null,e.neighbors.leftDown=null):t%this.columns==this.columns-1&&(e.neighbors.right=null,e.neighbors.rightUp=null,e.neighbors.rightDown=null),e.calcBombAround()}this.childObject[t].open()},Container.prototype.setVideoMines=function(t){reset(),gameover=!0,firstclick=!1,leftClick=!1,rightClick=!1,left_invalid=!1,right_invalid=!1,middle_invalid=!1,leftClickWithShift=!1,left_count=0,right_count=0,double_count=0,ces_count=0;for(let e in t)1!==t[e]&&"*"!==t[e]||(this.childObject[e].isBomb=!0);for(let t=0;t<this.rows*this.columns;t++){const e=this.childObject[t];e.neighbors.up=this.childObject[t-this.columns],e.neighbors.right=this.childObject[t+1],e.neighbors.down=this.childObject[t+this.columns],e.neighbors.left=this.childObject[t-1],e.neighbors.leftUp=this.childObject[t-this.columns-1],e.neighbors.rightUp=this.childObject[t-this.columns+1],e.neighbors.leftDown=this.childObject[t+this.columns-1],e.neighbors.rightDown=this.childObject[t+this.columns+1],t/this.columns==0?(e.neighbors.up=null,e.neighbors.leftUp=null,e.neighbors.rightUp=null):t/this.columns==this.rows-1&&(e.neighbors.down=null,e.neighbors.leftDown=null,e.neighbors.rightDown=null),t%this.columns==0?(e.neighbors.left=null,e.neighbors.leftUp=null,e.neighbors.leftDown=null):t%this.columns==this.columns-1&&(e.neighbors.right=null,e.neighbors.rightUp=null,e.neighbors.rightDown=null),e.calcBombAround()}},Container.prototype.replay_video=function(){!1===video_invalid?(container.init(video[0].level,this.columns,this.rows,this.bombNumber),container.setVideoMines(video[0].board),start_avf(video)):log("录像重放错误")},Container.prototype.reset_mine=function(){const t=$("#mark_span");if(t.html("UPK mode"),t.attr("title",t.html()),0!==left_count||!0===gameover){document.getElementById("mouse_point")&&$("div#mouse_point").remove(),changeTopCount("mine_count",container.minenumber=container.bombNumber),reset(),gameover=!1,firstclick=!1,leftClick=!1,rightClick=!1,left_invalid=!1,right_invalid=!1,middle_invalid=!1,leftClickWithShift=!1,left_count=0,right_count=0,double_count=0,ces_count=0,reset_begin=!0,path=0,log("重开布雷");for(const t in this.childObject)this.childObject[t].changeStyle("block"),this.childObject[t].isOpen=!1,this.childObject[t].is_bv=!0}else log("重新布雷无效")},Block.prototype.calcBombAround=function(){if(!this.isBomb){let t=0;for(const e in this.neighbors)if(this.neighbors.hasOwnProperty(e)){const n=this.neighbors[e];null!=n&&"function"!=typeof n&&n.isBomb&&t++}this.bombNumAround=t}};const EventUtil={};function lose(){!0===gameover&&0!==video&&(path=parseInt(video[size-1].path)),gameover=!0;const t=document.getElementById("container");for(let e=0;e<container.childObject.length;e++){const n=container.childObject[e].root.className;"block"===n&&!0===container.childObject[e].isBomb?t.childNodes[e].className="bomb":"openedBlockBomb"===n&&!1===container.childObject[e].isBomb&&(t.childNodes[e].className="wrongflag")}write_counters()}function setQuestionMode(t){question=t}function toggleQuestionMode(){setQuestionMode(!question),log("切换问号模式为："+question)}EventUtil.addEvent=function(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent?t.attachEvent("on"+e,n):t["on"+e]=n},EventUtil.removeEvent=function(t,e,n){t.removeEventListener?t.removeEventListener(e,n,!1):t.detachEvent?t.detachEvent("on"+e,n):t["on"+e]=null},Block.prototype.init=function(){const t=this;this.root=document.createElement("div"),EventUtil.addEvent(this.root,"mouseover",(function(e){if(!0===gameover)return!1;!1===t.isOpen&&!1===rightClick&&!0===leftClick?"block"===t.getStyle()&&!1===left_invalid&&t.changeStyle("opening"):(!0===rightClick&&!0===leftClick||!0===middle_invalid)&&t.change_around_opening()})),EventUtil.addEvent(this.root,"mouseout",(function(e){if(!0===gameover)return!1;!1===t.isOpen&&!0===leftClick&&!1===rightClick?"opening"===t.getStyle()&&t.changeStyle("block"):(!0===rightClick&&!0===leftClick||!0===middle_invalid)&&t.change_around_normal()})),EventUtil.addEvent(this.root,"mousedown",(function(e){if(!0===gameover)return!1;t.change_around_normal(),changeFaceClass("face_click"),0===e.button?!0===rightClick?(left_invalid=!0,t.change_around_opening()):"block"===t.getStyle()&&t.changeStyle("opening"):2===e.button?!0===leftClick?(left_invalid=!0,t.change_around_opening()):(right_count++,"openedBlockBomb"===t.getStyle()?!1===question?(ces_count++,t.changeStyle("block"),changeTopCount("mine_count",container.minenumber=container.minenumber+1)):(ces_count++,t.changeStyle("question"),changeTopCount("mine_count",container.minenumber=container.minenumber+1)):"block"===t.getStyle()?(ces_count++,t.changeStyle("openedBlockBomb"),changeTopCount("mine_count",container.minenumber=container.minenumber-1)):"question"===t.getStyle()?(ces_count++,t.changeStyle("block")):right_invalid=!0):1===e.button&&(middle_invalid=!0,t.change_around_opening())})),EventUtil.addEvent(this.root,"mouseup",(function(e){if(!0===gameover)return!1;!0===reset_begin&&(reset_begin=!1,start()),changeFaceClass("face_normal"),0===e.button?(!0===rightClick?(t.change_around_normal(),double_count++,!0===right_invalid&&(right_count--,right_invalid=!1)):!1===left_invalid&&left_count++,!1!==t.isOpen||!1!==rightClick||"opening"!==t.getStyle()&&"question"!==t.getStyle()?!0===rightClick&&!0===t.isOpen&&t.bombNumAround>0&&t.openaround():!0===firstclick?(firstclick=!1,container.setMine(t.id),start()):t.open(),left_invalid=!1):2===e.button?(!0===leftClick&&(double_count++,!0===right_invalid&&right_count--,t.change_around_normal(),!0===t.isOpen&&t.bombNumAround>0&&t.openaround()),right_invalid=!1):1===e.button&&(middle_invalid=!1,t.change_around_normal(),t.openaround())})),this.root.setAttribute("class","block"),this.root.setAttribute("id",t.id),this.changeStyle(this.className)},Block.prototype.changeStyle=function(t){this.root.setAttribute("class",t)},Block.prototype.change_around_opening=function(){null==this||void 0===this||this.isOpen||"block"!==this.getStyle()||this.changeStyle("opening");const t=[];t.push("up"),t.push("right"),t.push("down"),t.push("left"),t.push("leftUp"),t.push("rightUp"),t.push("leftDown"),t.push("rightDown");for(let e=0;e<t.length;e++){const n=this.neighbors[t[e]];null==n||void 0===n||n.isOpen||"block"!==n.getStyle()||n.changeStyle("opening")}},Block.prototype.change_around_normal=function(){null==this||void 0===this||this.isOpen||"opening"!==this.getStyle()||this.changeStyle("block");const t=[];t.push("up"),t.push("right"),t.push("down"),t.push("left"),t.push("leftUp"),t.push("rightUp"),t.push("leftDown"),t.push("rightDown");for(let e=0;e<t.length;e++){const n=this.neighbors[t[e]];null==n||void 0===n||n.isOpen||"opening"!==n.getStyle()||n.changeStyle("block")}},Block.prototype.getStyle=function(){let t=this.root.getAttribute("class");return null!=t&&void 0!==t||(t=this.root.getAttribute("className")),t},Block.prototype.open=function(){if(ces_count++,0===this.bombNumAround?this.changeStyle("opening"):this.bombNumAround>0?this.changeStyle("number_"+this.bombNumAround):(stop(),this.changeStyle("firstbomb"),lose(),changeFaceClass("face_cry")),this.isOpen=!0,0===this.bombNumAround){const t=[];t.push("up"),t.push("right"),t.push("down"),t.push("left"),t.push("leftUp"),t.push("rightUp"),t.push("leftDown"),t.push("rightDown");for(let e=0;e<t.length;e++){const n=this.neighbors[t[e]];null==n||void 0===n||n.isBomb||n.isOpen||"openedBlockBomb"===n.getStyle()||"question"===n.getStyle()||(n.open(),ces_count--)}}this.win()},Block.prototype.openaround=function(){let t=0,e=!1;const n=[];n.push("up"),n.push("right"),n.push("down"),n.push("left"),n.push("leftUp"),n.push("rightUp"),n.push("leftDown"),n.push("rightDown");for(let e=0;e<n.length;e++){const i=this.neighbors[n[e]];null==i||void 0===i||i.isOpen||"openedBlockBomb"!==i.getStyle()||t++}if(t===this.bombNumAround){for(let t=0;t<n.length;t++){const i=this.neighbors[n[t]];null==i||void 0===i||i.isOpen||"openedBlockBomb"===i.getStyle()||"bomb"===i.getStyle()||(i.around_open(),ces_count--,e=!0)}!0===e&&ces_count++}this.win()},Block.prototype.around_open=function(){if(ces_count++,0===this.bombNumAround?this.changeStyle("opening"):this.bombNumAround>0?this.changeStyle("number_"+this.bombNumAround):(stop(),this.changeStyle("firstbomb"),lose(),changeFaceClass("face_cry")),this.isOpen=!0,0===this.bombNumAround){const t=[];t.push("up"),t.push("right"),t.push("down"),t.push("left"),t.push("leftUp"),t.push("rightUp"),t.push("leftDown"),t.push("rightDown");for(let e=0;e<t.length;e++){const n=this.neighbors[t[e]];null==n||void 0===n||n.isBomb||n.isOpen||"openedBlockBomb"===n.getStyle()||(n.open(),ces_count--)}}},Block.prototype.win=function(){const t=document.getElementById("container").getElementsByTagName("div");let e=0;for(let n=0;n<t.length;n++){const i=t[n].className;("opening"===i||i.startsWith("number_"))&&e++}if(e===container.rows*container.columns-container.bombNumber){stop(),changeFaceClass("face_sunglasses"),!0===gameover&&0!==video&&(path=parseInt(video[size-1].path)),gameover=!0,log("You Win!");const t=document.getElementById("container");for(let e=0;e<container.childObject.length;e++){const n=container.childObject[e].root.className;"block"!==n&&"question"!==n||(t.childNodes[e].className="openedBlockBomb")}write_counters()}},document.onmousedown=function(){!1===gameover&&(0===event.button&&(leftClick=!0),2===event.button&&(rightClick=!0))},document.onmouseup=function(){!1===gameover&&(0===event.button&&(leftClick=!1),2===event.button&&(rightClick=!1))};const container=new Container(8,8,10);container.init(1),document.getElementById("containers").appendChild(container.html),document.getElementById("container").style="width:128px;height:128px;",container.add_mark(),parent.window.addEventListener("parentResize",(function(){adjustLayout()}));