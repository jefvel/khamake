var KhaExporter = require('./KhaExporter.js');
var korepath = require('./korepath.js');
var Converter = require('./Converter.js');
var Files = require(korepath + 'Files.js');
var Haxe = require('./Haxe.js');
var Options = require('./Options.js');
var Paths = require(korepath + 'Paths.js');
var exportImage = require('./ImageTool.js');
var fs = require('fs');
var path = require('path');

function Html5Exporter(directory) {
	KhaExporter.call(this);
	this.directory = directory;
	this.addSourceDirectory("Kha/Backends/HTML5");
};

Html5Exporter.prototype = Object.create(KhaExporter.prototype);
Html5Exporter.constructor = Html5Exporter;

Html5Exporter.prototype.sysdir = function () {
	return 'html5';
};

Html5Exporter.prototype.exportSolution = function (name, platform, haxeDirectory, from, callback) {
	this.createDirectory(this.directory.resolve(this.sysdir()));

	this.writeFile(this.directory.resolve("project-" + this.sysdir() + ".hxproj"));
	this.p("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
	this.p("<project version=\"2\">");
	this.p("<!-- Output SWF options -->", 1);
	this.p("<output>", 1);
	this.p("<movie outputType=\"Application\" />", 2);
	this.p("<movie input=\"\" />", 2);
	this.p("<movie path=\"html5\\kha.js\" />", 2);
	this.p("<movie fps=\"0\" />", 2);
	this.p("<movie width=\"0\" />", 2);
	this.p("<movie height=\"0\" />", 2);
	this.p("<movie version=\"1\" />", 2);
	this.p("<movie minorVersion=\"0\" />", 2);
	this.p("<movie platform=\"JavaScript\" />", 2);
	this.p("<movie background=\"#FFFFFF\" />", 2);
	if (Files.isDirectory(haxeDirectory)) this.p('<movie preferredSDK="' + from.resolve('build').relativize(haxeDirectory).toString() + '" />', 2);
	this.p("</output>", 1);
	this.p("<!-- Other classes to be compiled into your SWF -->", 1);
	this.p("<classpaths>", 1);
	for (var i = 0; i < this.sources.length; ++i) {
		this.p('<class path="' + from.resolve('build').relativize(from.resolve(this.sources[i])).toString() + '" />', 2);
	}
	this.p("</classpaths>", 1);
	this.p("<!-- Build options -->", 1);
	this.p("<build>", 1);
	this.p("<option directives=\"\" />", 2);
	this.p("<option flashStrict=\"False\" />", 2);
	this.p("<option mainClass=\"Main\" />", 2);
	this.p("<option enabledebug=\"False\" />", 2);
	this.p("<option additional=\"\" />", 2);
	this.p("</build>", 1);
	this.p("<!-- haxelib libraries -->", 1);
	this.p("<haxelib>", 1);
	this.p("<!-- example: <library name=\"...\" /> -->", 2);
	this.p("</haxelib>", 1);
	this.p("<!-- Class files to compile (other referenced classes will automatically be included) -->", 1);
	this.p("<compileTargets>", 1);
	this.p("<compile path=\"..\\Sources\\Main.hx\" />", 2);
	this.p("</compileTargets>", 1);
	this.p("<!-- Paths to exclude from the Project Explorer tree -->", 1);
	this.p("<hiddenPaths>", 1);
	this.p("<!-- example: <hidden path=\"...\" /> -->", 2);
	this.p("</hiddenPaths>", 1);
	this.p("<!-- Executed before build -->", 1);
	this.p("<preBuildCommand />", 1);
	this.p("<!-- Executed after build -->", 1);
	this.p("<postBuildCommand alwaysRun=\"False\" />", 1);
	this.p("<!-- Other project options -->", 1);
	this.p("<options>", 1);
	this.p("<option showHiddenPaths=\"False\" />", 2);
	this.p("<option testMovie=\"Webserver\" />", 2);
	this.p("<option testMovieCommand=\"html5/index.html\" />", 2);
	this.p("</options>", 1);
	this.p("<!-- Plugin storage -->", 1);
	this.p("<storage />", 1);
	this.p("</project>");
	this.closeFile();

	var index = this.directory.resolve(Paths.get(this.sysdir(), "index.html"));
	if (!Files.exists(index)) {
		var protoindex = fs.readFileSync(path.join(__dirname, 'Data', 'html5', 'index.html'), { encoding: 'utf8' });
		protoindex = protoindex.replace("{Name}", name);
		protoindex = protoindex.replace("{Width}", this.width);
		protoindex = protoindex.replace("{Height}", this.height);
		fs.writeFileSync(index.toString(), protoindex);
	}

	this.writeFile(this.directory.resolve("project-" + this.sysdir() + ".hxml"));
	for (var i = 0; i < this.sources.length; ++i) {
		this.p("-cp " + from.resolve('build').relativize(from.resolve(this.sources[i])).toString());
	}
	this.p("-js " + Paths.get(this.sysdir(), "kha.js").toString());
	this.p("-main Main");
	this.closeFile();

	if (Options.compilation) {
		var options = [];
		options.push("project-" + this.sysdir() + ".hxml");
		Haxe.executeHaxe(haxeDirectory, options, callback);
	}
	else {
		callback();
	}
};

Html5Exporter.prototype.copyMusic = function (platform, from, to, oggEncoder, aacEncoder, mp3Encoder) {
	Files.createDirectories(this.directory.resolve(this.sysdir()).resolve(to.toString()).parent());
	Converter.convert(from, this.directory.resolve(this.sysdir()).resolve(to.toString() + ".ogg"), oggEncoder);
	Converter.convert(from, this.directory.resolve(this.sysdir()).resolve(to.toString() + ".mp4"), aacEncoder);
};

Html5Exporter.prototype.copySound = function (platform, from, to, oggEncoder, aacEncoder, mp3Encoder) {
	Files.createDirectories(this.directory.resolve(this.sysdir()).resolve(to.toString()).parent());
	Converter.convert(from, this.directory.resolve(this.sysdir()).resolve(to.toString() + ".ogg"), oggEncoder);
	Converter.convert(from, this.directory.resolve(this.sysdir()).resolve(to.toString() + ".mp4"), aacEncoder);
};

Html5Exporter.prototype.copyImage = function (platform, from, to, asset) {
	exportImage(from, this.directory.resolve(this.sysdir()).resolve(to), asset);
};

Html5Exporter.prototype.copyBlob = function (platform, from, to) {
	this.copyFile(from, this.directory.resolve(this.sysdir()).resolve(to));
};

Html5Exporter.prototype.copyVideo = function (platform, from, to, h264Encoder, webmEncoder, wmvEncoder) {
	Files.createDirectories(this.directory.resolve(this.sysdir()).resolve(to.toString()).parent());
	Converter.convert(from, this.directory.resolve(this.sysdir()).resolve(to.toString() + ".mp4"), h264Encoder);
	Converter.convert(from, this.directory.resolve(this.sysdir()).resolve(to.toString() + ".webm"), webmEncoder);
};

module.exports = Html5Exporter;