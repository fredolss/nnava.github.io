define(['./uploadcontrol', './appcontrolhandler', './appcookies', './monthstaticvalues', './alasqlstockdata', './demodata', './portfoliocontrolhandler'], 
     function(uploadControl, appControlHandler, appCookies, monthstaticvalues, alasqlstockdata, demodata, portfolioControlHandler) {

    var monthsInput = monthstaticvalues.getMonthInputs();
    var today = new Date().toISOString().slice(0, 10);

    $(document).ready(function() {
        loadInputMonthNumber();

        uploadControl.setControlId('#dataFiles');
        uploadControl.load();

        setInputMonthNumberFromCookie();
        setCheckboxAutoLoadFromCookie();

        alasql.options.cache = false;
        kendo.culture("se-SE");

        loadSpantaxinfo();
        loadSpanAutoloadInfo();

        window.onresize = resizeObjects;

        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            if(e.delegateTarget.hash === "#portfolio" && uploadControl.getFilesCount() !== 0)
                runLoadSpreadhsheetStocksOnce();

            resizeObjects();
        });

        alasqlstockdata.createStockDataTable();
        alasqlstockdata.loadDataFromFileToTable();
    });

    var runLoadSpreadhsheetStocksOnce = (function() {
        var executed = false;
        return function () {
            if (!executed) {
                executed = true;
                $("#btnLoadSpreadsheetPortfolio").kendoButton().data("kendoButton").enable(true);
                portfolioControlHandler.loadSpreadsheetWithProgress();
            }
        };
    })();

    function loadInputMonthNumber() {
        $(".inputMonthNumber").kendoNumericTextBox({
            format: "#,0 kr",
            change: function() {
                appControlHandler.loadChartDonutExpenses();
                appControlHandler.loadChartDividendExpenses();
                saveInputMonthNumberToCookie();
            }
        });
    }

    function loadSpantaxinfo() {
        $("#spantaxinfo").kendoTooltip({
            content: "<div style=\"text-align:left\">Påverkar ej graferna: <br/> \
                      <ul>\
                           <li>Utdelningar/kostnader - nuvarande år</li> \
                           <li>Utdelningar/kostnader - total</li> \
                           <li>Utdelning och utdelningstillväxt per år</li> \
                      </ul></div>",
            position: "bottom",
            width: 300
        });
    }

    function loadSpanAutoloadInfo() {
        $("#spanautoloadinfo").kendoTooltip({
            content: "<div style=\"text-align:left\">Inställning styr om grafer ska laddas in automatiskt efter att filer är tillagda. \
                      Urkryssad ruta gör det möjligt att välja portföljer och därefter ladda in grafer via klick på knappen Ladda om.</div>",
            position: "bottom",
            width: 300
        });
    }

    function setCheckboxAutoLoadFromCookie() {
        var checkboxAutoLoadCookie = appCookies.getCookieValue('nnava_cbxautoload');
        if(checkboxAutoLoadCookie == null) return;
        $('#checkboxAutoLoad').prop('checked', checkboxAutoLoadCookie);
    }

    function setInputMonthNumberFromCookie() {
        var inputMonthNumberCookie = appCookies.getCookieValue('nnava_inputmonthnumbers');
        if(inputMonthNumberCookie == null) return;

        inputMonthNumberCookie.forEach(function(entry) {
            $('#' + entry.monthInputId).data("kendoNumericTextBox").value(entry.value);
        });
    }

    function saveInputMonthNumberToCookie() {
        var monthNumber = 11;
        var inputMonthNumber = [];

        for(var i=0; i <= monthNumber; i++) {
            var month = i + 1;
            inputMonthNumber.push({monthInputId: monthsInput[i], value: $('#' + monthsInput[i]).data("kendoNumericTextBox").value()});
        }

        appCookies.createCookie('nnava_inputmonthnumbers', JSON.stringify(inputMonthNumber), 365);
    }

    document.getElementById('checkboxAutoLoad').addEventListener('change', function(e) {
        appCookies.createCookie('nnava_cbxautoload', e.target.checked, 365);
    });
    
    function resizeObjects() {
        kendo.resize($("#chartYearDeposit"));
        kendo.resize($("#chartDividendYearGrowth"));
        kendo.resize($("#chartDividendYearMonth"));
        kendo.resize($("#chartDividendExpensesMonth"));
        kendo.resize($("#chartDonutDividendTotal"));
        kendo.resize($("#treeMapDividend"));
        kendo.resize($("#treeMapPortfolioCurrency"));        
        kendo.resize($("#chartTransactionBuyLine"));
        kendo.resize($("#chartTransactionSellLine"));
        kendo.resize($("#chartDividendCumulative"));
        kendo.resize($("#chartDividendStackedCumulative"));
        kendo.resize($("#chartCourtageYear"));
        kendo.resize($("#chartDonutDividend"));
        kendo.resize($('#chartTransactionNetYearGrowth'));
        kendo.resize($('#chartDonutPortfolioAllocation'));
        kendo.resize($('#chartDonutPortfolioCurrency')); 
        kendo.resize($('#chartFunnelPortfolioIndustry'));
        kendo.resize($('#chartRadarPortfolioIndustry'));
        kendo.resize($('#chartDividendStackedCumulativePortfolio'));
    }

    document.getElementById('btnLoadPortfolioCharts').addEventListener('click', function() {            
        kendo.ui.progress($(document.body), true);
        
        setTimeout(function(){               
            portfolioControlHandler.saveSpreadsheetDataToTable();
            portfolioControlHandler.loadControls();

            kendo.ui.progress($(document.body), false);

            var panelChartDonutPortfolioAllocation = $('#panelChartDonutPortfolioAllocation').offset();
            $('html, body').animate({scrollTop: panelChartDonutPortfolioAllocation.top}, "slow");
        }, 1);
    });

    document.getElementById('btnLoadSpreadsheetPortfolio').addEventListener('click', function() {
        loadSpreadsheetPortfolio();
    });

    function loadSpreadsheetPortfolio() {
        kendo.ui.progress($(document.body), true);
        
        setTimeout(function(){               
            portfolioControlHandler.loadSpreadsheetWithProgress();
        }, 1);
    }

    document.getElementById('btnReloadPortfolio').addEventListener('click', function() {

        appControlHandler.saveSettings();

        kendo.ui.progress($(document.body), true);
        
        setTimeout(function(){               
            appControlHandler.loadControlsFull();
        }, 1);

    });

    document.getElementById('btnDemo').addEventListener('click', function() {

        kendo.ui.progress($(document.body), true);
        
        setTimeout(function(){               
            demodata.createDemoData();
            appControlHandler.loadControlsFull();
            $("#btnLoadSpreadsheetPortfolio").kendoButton().data("kendoButton").enable(true);
        }, 1);

    });

    document.getElementById('btnSetInputMonthValues').addEventListener('click', function() {
        
        var newValue = $("#inputMonthParent").data("kendoNumericTextBox").value();
        
        $("#inputJanuari").data("kendoNumericTextBox").value(newValue);
        $("#inputFebruari").data("kendoNumericTextBox").value(newValue);
        $("#inputMars").data("kendoNumericTextBox").value(newValue);
        $("#inputApril").data("kendoNumericTextBox").value(newValue);
        $("#inputMaj").data("kendoNumericTextBox").value(newValue);
        $("#inputJuni").data("kendoNumericTextBox").value(newValue);
        $("#inputJuli").data("kendoNumericTextBox").value(newValue);
        $("#inputAugusti").data("kendoNumericTextBox").value(newValue);
        $("#inputSeptember").data("kendoNumericTextBox").value(newValue);
        $("#inputOktober").data("kendoNumericTextBox").value(newValue);
        $("#inputNovember").data("kendoNumericTextBox").value(newValue);
        $("#inputDecember").data("kendoNumericTextBox").value(newValue);

        appControlHandler.loadChartDonutExpenses();
        appControlHandler.loadChartDividendExpenses();
        saveInputMonthNumberToCookie();
    });

    document.getElementById('btnExportToPng').addEventListener('click', function() {
        $(".export-chartToImg").each(function(index) {
            $(this).click();
        });

        $(".export-DOMToImg").each(function(index) {
            $(this).click();
        });        
    });

    document.getElementById('btnExportToSvg').addEventListener('click', function() {
        $(".export-chartToSvg").each(function(index) {
            $(this).click();
        });
        
        $(".export-DOMToSvg").each(function(index) {
            $(this).click();
        });
    });

    function DOMToPdf(id, fileName) {
        kendo.drawing.drawDOM($(id))
        .then(function(group) {
            return kendo.drawing.exportPDF(group, {
                paperSize: "auto",
                margin: { left: "1cm", top: "1cm", right: "1cm", bottom: "1cm" }
            });
        })
        .done(function(data) {
            kendo.saveAs({
                dataURI: data,
                fileName: fileName
            });
        });
    }

    document.getElementById('btnExportToPdf').addEventListener('click', function() {
        var fileName = "nnava_" + today + ".pdf";
        DOMToPdf(".content-wrapper", fileName);
    });

    $(".export-DOMToPdf").click(function() {
        var chartId = "#" + this.id.toString().replace("btn-", "").replace("ToPdf", "");
        var chartFilename = getChartFilename(chartId) + ".pdf";
        DOMToPdf(chartId, chartFilename);
    });

    $(".export-chartToSvg").click(function() {
        var chartId = this.id.toString().replace("btn-", "").replace("ToSvg", "");
        var chartFilename = getChartFilename(chartId) + ".svg";

        var chart = $("#" + chartId).getKendoChart();
        chart.exportSVG().done(function(data) {
            kendo.saveAs({
                dataURI: data,
                fileName: chartFilename
            });
        });
    });

    $(".export-DOMToSvg").click(function() {
        var domId = this.id.toString().replace("btn-", "").replace("ToSvg", "");
        var filename = getChartFilename(domId) + ".svg";

        kendo.drawing.drawDOM($("#" + domId))
            .then(function(domObject) {
                return kendo.drawing.exportSVG(domObject);
            })
            .done(function(data) {        
                kendo.saveAs({
                    dataURI: data,
                    fileName: filename
            });
        });
    });

    $(".export-DOMToImg").click(function() {
        var domId = this.id.toString().replace("btn-", "").replace("ToImg", "");
        var filename = getChartFilename(domId) + ".png";

        kendo.drawing.drawDOM($("#" + domId))
            .then(function(domObject) {
                return kendo.drawing.exportImage(domObject);
            })
            .done(function(data) {
                kendo.saveAs({
                    dataURI: data,
                    fileName: filename
            });
        });
    });

    $(".export-chartToImg").click(function() {
        var chartId = this.id.toString().replace("btn-", "").replace("ToImg", "");
        var chartFilename = getChartFilename(chartId) + ".png";

        var chart = $("#" + chartId).getKendoChart();
        chart.exportImage().done(function(data) {
            kendo.saveAs({
                dataURI: data,
                fileName: chartFilename,
            });
        });
    });

    $(".export-chartToPdf").click(function() {
        var chartId = this.id.toString().replace("btn-", "").replace("ToPdf", "");
        var chartFilename = getChartFilename(chartId) + ".pdf";

        var chart = $("#" + chartId).getKendoChart();
        chart.exportPDF({ paperSize: "auto", margin: { left: "1cm", top: "1cm", right: "1cm", bottom: "1cm" } }).done(function(data) {
            kendo.saveAs({
                dataURI: data,
                fileName: chartFilename
            });
        });
    });

    function getChartFilename(chartId) {
        var chartFilename = "NOTFOUND";
        chartId = chartId.replace("#", "");
        
        switch(chartId) {
            case "chartDividendExpensesMonth":
                chartFilename = "utdelningar_utgifter";
                break;
            case "chartDonutDividendTotal":
                chartFilename = "utdelningar_utgifter_total";
                break;
            case "chartDividendYearGrowth":
                chartFilename = "utd_utdtillväxt_år";
                break;
            case "treeMapDividend":
                chartFilename = "treemap_utd_år";
                break;
            case "treeMapPortfolioCurrency":
                chartFilename = "portföljöversikt_treemap_fördelning_valuta";
                break;
            case "chartDonutDividend":
                chartFilename = "donut_utd_år";
                break;
            case "chartDividendYearMonth":
                chartFilename = "utdelningar_månad_år";
                break;
            case "chartYearDeposit":
                chartFilename = "insättningar";
                break;
            case "chartTransactionSellLine":
                chartFilename = "transaktioner_sälj";
                break;
            case "chartTransactionBuyLine":
                chartFilename = "transaktioner_köp";
                break;
            case "chartDividendCumulative":
                chartFilename = "utdelningar_ackumulerad_total";
                break;
            case "chartDividendStackedCumulative":
                chartFilename = "utdelningar_ackumulerad_månad_värdepapper";
                break;
            case "chartCourtageYear":
                chartFilename = "courtage_år";
                break;
            case "chartTransactionNetYearGrowth":
                chartFilename = "köp_sälj_nettoinvesterat_år";
                break;
            case "chartDonutPortfolioAllocation":
                chartFilename = "portföljöversikt_fördelning_innehav";
                break;
            case "chartDonutPortfolioCurrency":
                chartFilename = "portföljöversikt_fördelning_valuta";
                break;  
            case "chartFunnelPortfolioIndustry":
                chartFilename = "portföljöversikt_funnel_fördelning_bransch";
                break;   
            case "chartRadarPortfolioIndustry" :
                chartFilename = "portföljöversikt_radar_fördelning_bransch";
                break;  
            case "chartDividendStackedCumulativePortfolio" :
                chartFilename = "portföljöversikt_erhållnaförväntade_utdelningar";
                break;                            
            default:
                chartFilename = "NOTFOUND";
        }

        return chartFilename + "_" + today;
    }

});