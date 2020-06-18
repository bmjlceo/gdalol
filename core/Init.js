const requireDirectory = require('require-directory');
const express = require('express');
const Router = express.Router;
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

class InitManager {
	static init(app) {
		this.app = app;
		// parse application/json
		this.app.use(bodyParser.json({ limit: '50mb' }));
		this.app.use(cookieParser());
		this.LoadCustomCode();
		this.LoadConfig();
		this.LoadException();
		this.OpenStatic();
		this.LoadRender();
		this.LoadRoutes();
		this.LoadMiddleware();
	}

	/**
	 * 加载模板引擎
	 */
	static LoadRender() {
		this.app.engine('html', require('express-art-template'));
		this.app.set('views', path.join(__dirname, '../views'));
		this.app.set('view engine', 'html');
	}

	/**
	 * 加载路由
	 */
	static LoadRoutes() {
		requireDirectory(module, path.resolve(__dirname, '../routes'), {
			extensions: ['js'],
			visit: obj => {
				if (obj instanceof Router) {
					this.app.use(obj.prefix, obj);
				}
			},
		});
	}

	/**
	 * 加载自定义代码并挂载至Global
	 */
	static LoadCustomCode() {
		const CodePath = path.resolve(__dirname, '../config/code');
		const code = require(CodePath);
		global.code = code;
	}

	/**
	 * 加载配置文件并挂载至Global
	 */
	static LoadConfig() {
		const ConfigPath = path.resolve(__dirname, '../config/config');
		const config = require(ConfigPath);
		global.config = config;
	}

	/**
	 * 加载错误类并挂载到global上
	 */
	static LoadException() {
		const ExpcetionClassPath = path.resolve(__dirname, './http-exception');
		const HttpException = require(ExpcetionClassPath);
		global.HttpException = HttpException;
	}

	/**
	 * 开发静态资源
	 */
	static OpenStatic() {
		const StaticPath = path.resolve(__dirname, '../static');
		this.app.use(express.static(StaticPath));
	}

	/**
	 * 加载错误捕获中间件
	 */
	static LoadMiddleware() {
		const {
			CatchHttpException,
			CustomNotFound,
		} = require('../middlewares/exception');
		this.app.use(CustomNotFound);
		this.app.use(CatchHttpException);
	}
}

module.exports = InitManager;
