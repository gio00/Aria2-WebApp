"use strict";$(function(){$('[data-toggle="tooltip"]').tooltip({delay:{show:700,hide:100}})});var options={host:"localhost",port:6800,secure:!1},_aria=new Aria2(options);Vue.config.debug=!0;var v=new Vue({el:"#body",data:{urlfield:"",torrent:"",ariaOpt:{},toggle:!1,connected:!1,options:{},active:[],waiting:[],stopped:[]},ready:function(){this.ariaOpt=options,this.relaodAria(),setInterval(this.initAria,1e3),this.setupNotifications()},computed:{aria2:function(){return _aria},all:function(){return this.stopped.concat(this.waiting).concat(this.active)}},methods:{onFileChange:function(t){var i=t.target.files||t.dataTransfer.files;i.length&&this.createImage(i[0])},createImage:function(t){var i=new FileReader,o=this;i.readAsDataURL(t),i.onload=function(t){o.torrent=t.target.result.substr("data:;base64,".length),o.downloadAll()},i.onerror=function(t){}},removeImage:function(t){this.image=""},downloadAll:function(){var t=this;if(""!=this.torrent)_aria.addTorrent(t.torrent,t.callback);else{var i=this.urlfield.split(" ");if(!this.toggle)for(var o=0;o<i.length;o++)_aria.addUri([i[o]],t.callback)}},relaodAria:function(){_aria=new Aria2(this.ariaOpt);var t=this;_aria.open(function(){_aria.getGlobalOption(function(i,o){t.options=o})}),this.toggle=!1},setupNotifications:function(){notify.requestPermission(function(){var t=notify.permissionLevel();t===notify.PERMISSION_GRANTED});var t=this;_aria.onDownloadComplete=function(i){t.notify(i.gid,"Download Complete")},_aria.onDownloadStart=function(i){t.notify(i.gid,"Download Started")}},notify:function(t){function i(i,o){return t.apply(this,arguments)}return i.toString=function(){return t.toString()},i}(function(t,i){_aria.getFiles(t,function(t,o){void 0!=t&&this.notifyError(t),notify.createNotification(o[0].path.split("/")[o[0].path.split("/").length-1],{body:i,icon:"images/icon.png"})})}),notifyError:function(t){void 0!=t&&notify.createNotification("Errore",{body:t.message,icon:"images/icon.png"})},optCallback:function(t,i){$("#alertspace").append('<div id="alert" class="alert alert-success"><a class="close" data-dismiss="alert">×</a><span>'+i+"</span></div>"),setTimeout(function(){$("#alert").remove()},4e3),this.toggle=!this.toggle},callback:function(t,i){t&&this.notifyError(t),console.log(i)},byteCount:function(t,i){if(t<(i=i||1e3))return t+" B";var o=Math.floor(Math.log(t)/Math.log(i)),n=" "+(1e3===i?"kMGTPE":"KMGTPE").charAt(o-1)+(1e3===i?"":"i")+"B";return(t/Math.pow(i,o)).toFixed(1)+n},initAria:function(){var t=this;_aria.tellActive(function(i,o){i?(t.notifyError(i),t.connected=!1):t.connected=!0,t.$set("active",o)}),_aria.tellWaiting(0,1e3,function(i,o){i?(t.notifyError(i),t.connected=!1):t.connected=!0,t.$set("waiting",o)}),_aria.tellStopped(0,1e3,function(i,o){i?(t.notifyError(i),t.connected=!1):t.connected=!0,t.$set("stopped",o)})}}});