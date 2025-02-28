const App = (() => {
    let jsonData = null;
    let csvData = null;

    const init = () => {
        setupEventListeners();
    };
