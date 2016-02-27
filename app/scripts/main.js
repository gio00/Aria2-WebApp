var options = { 'host': 'localhost', 'port': 6800, 'secure': false }
var aria2 = new Aria2(options)
var isOpen = false
aria2.open(function() {
    Vue.config.debug = true;
    var v = new Vue({
        el: '#body',
        data: {
            urlfield: '',
            ariaOpt: {},
            toggle: false,
            connected: false,
            options:{},
            active: [],
            waiting: [],
            stopped: []
        },
        ready: function() {
            setInterval(this.initAria, 1000);
            this.ariaOpt = options
            this.setupNotifications();
            var self = this;
            aria2.getGlobalOption(function(err, res) {
                self.options = res
            });
        },
        computed: {
            aria2: function() {
                return aria2
            },
            all: function() {
                return this.stopped.concat(this.waiting).concat(this.active)
            }
        },
        methods: {
            relaodAria: function() {
                aria2 = new Aria2(this.ariaOpt)
                aria2.open(function() {});
                this.toggle = ! this.toggle
            },
            setupNotifications: function() {
                notify.requestPermission(function() {
                    var permissionLevel = notify.permissionLevel();
                    var permissionsGranted = (permissionLevel === notify.PERMISSION_GRANTED);
                });
                var self = this;
                aria2.onDownloadComplete = function(gid) {
                    self.notify(gid["gid"], 'Download Complete')
                };
                aria2.onDownloadStart = function(gid) {
                    self.notify(gid["gid"], 'Download Started')
                }
            },
            notify: function(gid, message) {
                aria2.getFiles(gid, function(err, res) {
                    if (undefined != err) {
                        this.notifyError(err)
                    }
                    notify.createNotification((res[0].path.split('/'))[res[0].path.split('/').length - 1], {
                        body: message,
                        icon: "images/icon.png"
                    });
                });
            },
            notifyError: function(err) {
                if (undefined != err) {
                    notify.createNotification("Errore", {
                        body: err["message"],
                        icon: "images/icon.png"
                    });
                }
            },
            optCallback: function(err, res) {
                $('#alertspace').append('<div id="alert" class="alert alert-success"><a class="close" data-dismiss="alert">×</a><span>' + res + '</span></div>')
                setTimeout(function() {
                    $('#alert').remove();
                }, 4000);
                this.toggle = ! this.toggle
            },
            callback: function(err, res) {
                if (err) {
                    this.notifyError(err)
                }
                console.log(res)
            },
            byteCount: function(bytes, unit) {
                if (bytes < (unit = unit || 1000))
                    return bytes + " B";
                var exp = Math.floor(Math.log(bytes) / Math.log(unit));
                var pre = ' ' + (unit === 1000 ? "kMGTPE" : "KMGTPE").charAt(exp - 1) + (unit === 1000 ? "" : "i") + 'B';
                return (bytes / Math.pow(unit, exp)).toFixed(1) + pre;
            },
            initAria: function() {
                var self = this;

                aria2.tellActive(function(err, res) {
                    if (err) {
                        self.notifyError(err)
                        self.connected = false
                    } else {
                        self.connected = true
                    }
                    self.$set('active', res)
                });
                aria2.tellWaiting(0, 1000, function(err, res) {
                    if (err) {
                        self.notifyError(err)
                        self.connected = false
                    } else {
                        self.connected = true
                    }
                    self.$set('waiting', res)
                });
                aria2.tellStopped(0, 1000, function(err, res) {
                    if (err) {
                        self.notifyError(err)
                        self.connected = false
                    } else {
                        self.connected = true
                    }
                    self.$set('stopped', res)
                });
            }
        }
    })
});
