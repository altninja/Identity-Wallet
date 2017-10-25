module.exports = function (app) {
    let controller = {};
    let fs = app.modules.fs;

    controller.copyFile = function (source, target, cb) {
        var cbCalled = false;

        var rd = fs.createReadStream(source);
        rd.on('error', function (err) {
            done(err);
        });
        var wr = fs.createWriteStream(target);
        wr.on('error', function (err) {
            done(err);
        });
        wr.on('close', function (ex) {
            done();
        });
        rd.pipe(wr);

        function done(err) {
            if (!cbCalled) {
                cb(err);
                cbCalled = true;
            }
        }
    }

/*
  mv(args.src, args.dest, (err) => {
    win.webContents.send('MOVE_FILE', err);  
  });
  */

    return controller;
}