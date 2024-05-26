async function fetchStockData(interval) {
    const apiKey = 'demo'; // Replace 'demo' with your actual API key from Alpha Vantage
    const symbol = 'IBM';
    let functionType, apiUrl;

    if (interval === '1day') {
        functionType = 'TIME_SERIES_DAILY';
    } else {
        functionType = 'TIME_SERIES_INTRADAY';
        apiUrl = `https://www.alphavantage.co/query?function=${functionType}&symbol=${symbol}&interval=${interval}&outputsize=full&apikey=${apiKey}`;
    }

    apiUrl = apiUrl || `https://www.alphavantage.co/query?function=${functionType}&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (functionType === 'TIME_SERIES_DAILY' && data['Time Series (Daily)']) {
            return data['Time Series (Daily)'];
        } else if (data[`Time Series (${interval})`]) {
            return data[`Time Series (${interval})`];
        } else {
            throw new Error('Invalid stock data format');
        }
    } catch (error) {
        console.error('Error fetching stock data:', error.message);
        return null;
    }
}

async function renderStockChart() {
    const intervalSelect = document.getElementById('intervalSelect');
    const selectedInterval = intervalSelect.value;

    const timeSeries = await fetchStockData(selectedInterval);

    if (!timeSeries) {
        console.log('Failed to retrieve stock data.');
        return;
    }

    const timestamps = Object.keys(timeSeries).sort();
    const openPrices = timestamps.map(timestamp => parseFloat(timeSeries[timestamp]['1. open']));
    const closePrices = timestamps.map(timestamp => parseFloat(timeSeries[timestamp]['4. close']));

    const traceOpen = {
        type: 'scatter',
        mode: 'lines',
        name: 'Open Price',
        x: timestamps,
        y: openPrices,
        line: { color: 'blue' }
    };

    const traceClose = {
        type: 'scatter',
        mode: 'lines',
        name: 'Close Price',
        x: timestamps,
        y: closePrices,
        line: { color: 'green' }
    };

    const layout = {
        title: `Stock Price Chart (${selectedInterval} Aggregation)`,
        xaxis: { title: 'Timestamp' },
        yaxis: { title: 'Price' }
    };

    const chartData = [traceOpen, traceClose];
    Plotly.newPlot('chartContainer', chartData, layout);
}

renderStockChart();
