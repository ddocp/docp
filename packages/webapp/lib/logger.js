
module.exports = class LoggerPlugin {
  apply(compiler) {
    // you can access Logger from compiler
    const logger = compiler.getInfrastructureLogger('logger');
    compiler.hooks.entryOption.tap('MyPlugin', (context, entry) => {
      debugger
      logger.info('log from compilation');
      /* ... */
    });
  }
}
