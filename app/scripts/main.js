"use strict";

$(function () {
  $('[data-toggle="tooltip"]').tooltip({delay: { 'show': 700, 'hide': 100 }});
});

var options = { 'host': 'localhost', 'port': 6800, 'secure': false };
var aria2 = new Aria2(options);
Vue.config.debug = true;
var v = new Vue({
    el: '#body',
    data: {
        globalStats: {},
        urlfield: '',
        torrent:'',
        ariaOpt: {},
        toggle: false,
        connected: false,
        options:{},
        active: [],
        waiting: [],
        stopped: []
    },
    ready: function() {
        this.ariaOpt = options;
        this.checkCookie();
        this.relaodAria();
        setInterval(this.initAria, 1000);
        this.setupNotifications();
    },
    computed: {
        aria2: function() {
            return aria2;
        },
        all: function() {
            return this.stopped.concat(this.waiting).concat(this.active);
        }
    },
    methods: {
        classByStatus: function(d){
            if(d.status == 'complete')
                return 'success';
            if(d.status == 'active')
                return 'primary';
            if(d.status == 'error')
                return 'danger';
            if(d.status == 'paused')
                return 'warning';
            if(d.status == 'waiting')
                return 'info';
            if(d.status == 'removed')
                return 'danger';
            if ( d.status == 'active' || (d.totalLength == 0 ) & d.status != 'removed' )
                return 'active';
        },
        setCookie:function(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = 'expires='+d.toUTCString();
            document.cookie = cname + '=' + cvalue + '; ' + expires;
        },
         getCookie: function(cname) {
            var name = cname +'=';
            var ca = document.cookie.split(';');
            for(var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return '';
        },
        checkCookie:function(){
          var host = this.getCookie('host');
           if (host!='') {
             this.ariaOpt['host'] = host;
           }
         },
        onFileChange: function(e) {
          var files = e.target.files || e.dataTransfer.files;
          if (!files.length) return;
          this.createImage(files[0]);
        },
        createImage: function(file) {
          var reader = new FileReader();
          var self = this;
          reader.readAsDataURL(file);
          reader.onload = function (e) {
              self.torrent = e.target.result.substr('data:;base64,'.length);
              self.downloadAll();
          }
          reader.onerror = function (e) {
              // notify an Error
          }
        },
        removeImage: function (e) {
          this.image = '';
        },
        downloadAll: function(){
            var self = this;
            if(this.torrent != ""){
                aria2.addTorrent(self.torrent, self.callback);
            }else{
                var urls = this.urlfield.split(' ')
                if(!this.toggle){
                    for (var i = 0; i < urls.length; i++) {
                        aria2.addUri([urls[i]], self.callback);
                    }
                }
            }
        },
        relaodAria: function() {
            this.active=[];
            this.waiting=[];
            this.stopped=[];
            this.connected = false;
            aria2 = new Aria2(this.ariaOpt);
            var self = this;
            this.setCookie('host', this.ariaOpt['host'], 100);
            aria2.open(function() {
                aria2.getGlobalOption(function(err, res) {
                    self.options = res;
                });
            });
            this.toggle = false;
        },
        setupNotifications: function() {
            notify.requestPermission(function() {
                var permissionLevel = notify.permissionLevel();
                var permissionsGranted = (permissionLevel === notify.PERMISSION_GRANTED);
            });
            var self = this;
            aria2.onDownloadComplete = function(gid) {
                self.notify(gid['gid'], 'Download Complete');
            };
            aria2.onDownloadStart = function(gid) {
                self.notify(gid['gid'], 'Download Started');
            }
        },
        notify: function(gid, message) {
            aria2.getFiles(gid, function(err, res) {
                if (undefined != err) {
                    this.notifyError(err);
                }
                notify.createNotification((res[0].path.split('/'))[res[0].path.split('/').length - 1], {
                    body: message,
                    icon: 'images/icon.png'
                });
            });
        },
        notifyError: function(err) {
            if (undefined != err) {
                notify.createNotification('Errore', {
                    body: err['message'],
                    icon: 'images/icon.png'
                });
            }
        },
        optCallback: function(err, res) {
            $('#alertspace').append('<div id="alert" class="alert alert-success"><a class="close" data-dismiss="alert">×</a><span>' + res + '</span></div>');
            setTimeout(function() {
                $('#alert').remove();
            }, 4000);
            this.toggle = ! this.toggle;
        },
        callback: function(err, res) {
            if (err) {
                this.notifyError(err);
            }
            console.log(res);
        },
        byteCount: function(bytes, unit) {
            if (bytes < (unit = unit || 1000))
                return bytes + ' B';
            var exp = Math.floor(Math.log(bytes) / Math.log(unit));
            var pre = ' ' + (unit === 1000 ? 'kMGTPE' : 'KMGTPE').charAt(exp - 1) + (unit === 1000 ? '' : 'i') + 'B';
            return (bytes / Math.pow(unit, exp)).toFixed(1) + pre;
        },
        initAria: function() {
            var self = this;
            aria2.getGlobalStat(function(err, res){
                if (err) {
                    self.notifyError(err);
                    self.connected = false;
                } else {
                    self.connected = true;
                }
                self.globalStats = res;
            });
            aria2.tellActive(function(err, res) {
                if (err) {
                    self.notifyError(err);
                    self.connected = false;
                } else {
                    self.connected = true;
                }
                self.$set('active', res);
            });
            aria2.tellWaiting(0, 1000, function(err, res) {
                if (err) {
                    self.notifyError(err);
                    self.connected = false;
                } else {
                    self.connected = true;
                }
                self.$set('waiting', res)
            });
            aria2.tellStopped(0, 1000, function(err, res) {
                if (err) {
                    self.notifyError(err);
                    self.connected = false;
                } else {
                    self.connected = true;
                }
                self.$set('stopped', res);
            });
        }
    }
});
