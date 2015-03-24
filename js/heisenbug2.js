if (window.DEBUG) {
    console.info('spent', Date.now() - window.timeHeisenbug, 'ms on loading libs');
    window.timeHeisenbug = Date.now();
}