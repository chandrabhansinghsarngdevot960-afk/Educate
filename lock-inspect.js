// Block DevTools and Inspect
(function() {
    // Disable right-click context menu
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    // Disable DevTools keyboard shortcuts
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J')) {
            e.preventDefault();
        }
    });
    
    // Detect DevTools opening
    setInterval(() => {
        const start = new Date().getTime();
        debugger;
        if (new Date().getTime() - start > 100) {
            document.body.style.display = 'none';
            console.clear();
            alert('🔒 Access Denied: Inspect/DevTools is blocked');
            window.location.href = 'about:blank';
        }
    }, 1000);
    
    // Disable console access
    console.log = function() {};
    console.warn = function() {};
    console.error = function() {};
})();
