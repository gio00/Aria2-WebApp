Vue.config.debug = true;
var v = new Vue({
            el: '#body',
            data: {
                urlfield:'',
                active:[],
                waiting:[],
                stopped:[]
            },
            ready:function() {
                this.initAria()
                setInterval(this.initAria, 1000);
                notify.requestPermission(function() {
                    var permissionLevel = notify.permissionLevel();
                    var permissionsGranted = (permissionLevel === notify.PERMISSION_GRANTED);
                });

            },
            computed:{
                aria2:function(){
                    var options = {'host': 'localhost', 'port': 6800, 'secure': false}
                    var aria2 = new Aria2(options)
                    return aria2
                },
                all:function(){
                    return   this.stopped.concat(this.waiting).concat(this.active)
                }
            },
            methods:{
                callback: function(err,res){
                    console.log(err)
                    console.log(res)
                },
                byteCount: function (bytes, unit) {
                  if (bytes < (unit = unit || 1000)) 
                    return bytes + " B";
                  var exp = Math.floor (Math.log (bytes) / Math.log (unit));
                  var pre = ' ' +(unit === 1000 ? "kMGTPE" : "KMGTPE").charAt (exp - 1) + (unit === 1000 ? "" : "i") + 'B';
                    return (bytes / Math.pow (unit, exp)).toFixed (1) + pre;
                },
                initAria:function(){
                    var self = this;
                    this.aria2.open(function() {
                        self.aria2.tellActive( function(err, res) {
                            console.log(res)
                            console.log(err)
                            self.$set('active', res) 
                        });
                        self.aria2.tellWaiting(0,1000, function(err, res) {
                            console.log(res)
                            console.log(err)
                            self.$set('waiting', res)
                        });
                        self.aria2.tellStopped(0,1000, function(err, res) {
                            console.log(res)
                            console.log(err)
                            self.$set('stopped', res)
                        });
                        self.aria2.onDownloadComplete = function(gid){
                            notify.createNotification(gid, {
                                body: "Download Complete",
                                icon: "images/icon.png"
                            });
                        };
                    });

                }
            }
        })