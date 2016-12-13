define(['./alasql.min'], function(alasqlhelper) {
    
    var sourceData;

    function setSourceData(fieldValue) {
        if(fieldValue.length == 0)
            sourceData = [];
        else 
            sourceData = JSON.parse(fieldValue);
    }

    function getDividendSumBelopp(year, month) {
        return alasql('SELECT SUM(Belopp::NUMBER) AS Belopp \
                       FROM ? \
                       WHERE YEAR(Likviddag) = ' + year + ' AND MONTH(Bokforingsdag) = ' + month + ' \
                       AND Transaktionstyp = "UTDELNING" \
                       GROUP BY YEAR(Likviddag), MONTH(Likviddag)', [sourceData]);
    }

    function getDividendMaxYear() {
        return alasql('SELECT MAX(YEAR(Bokforingsdag)) AS Ar \
                       FROM ? \
                       WHERE Transaktionstyp = "UTDELNING"', [sourceData]);
    }

    function getDividendYears() {
        return alasql('SELECT FIRST(YEAR(Bokforingsdag)) AS Ar \
                       FROM ? \
                       WHERE Transaktionstyp = "UTDELNING" \
                       GROUP BY YEAR(Bokforingsdag) \
                       ORDER BY 1', [sourceData]);
    }

    function getDepositYears() {
        return alasql('SELECT FIRST(YEAR(Bokforingsdag)) AS Ar \
                       FROM ? \
                       WHERE Transaktionstyp = "UTTAG" AND Transaktionstyp = "INSATTNING" OR Transaktionstyp = "PREMIEINBETALNING" \
                       GROUP BY YEAR(Bokforingsdag) \
                       ORDER BY 1', [sourceData]);
    }

    function getDividendMonthSumBelopp(year, month) {
        return alasql('SELECT SUM(Belopp::NUMBER) AS Belopp \
                       FROM ? \
                       WHERE YEAR(Bokforingsdag) = ' + year + ' AND MONTH(Bokforingsdag) = ' + month + ' \
                       AND Transaktionstyp = "UTDELNING" \
                       GROUP BY YEAR(Bokforingsdag), MONTH(Bokforingsdag)', [sourceData]);
    }

    function getDividendYearSumBelopp(year) {
        var result = alasql('SELECT SUM(Belopp::NUMBER) AS Belopp \
                       FROM ? \
                       WHERE YEAR(Bokforingsdag) = ' + year + ' \
                       AND Transaktionstyp = "UTDELNING" \
                       GROUP BY YEAR(Bokforingsdag)', [sourceData]);

        var belopp = JSON.parse(JSON.stringify(result));

        return parseInt(belopp["0"].Belopp);
    }

    function getTaxYearSumBelopp(year) {
        var result = alasql('SELECT SUM(Belopp::NUMBER) AS Belopp \
                       FROM ? \
                       WHERE YEAR(Bokforingsdag) = ' + year + ' \
                       AND Transaktionstyp = "UTL KUPSKATT" \
                       GROUP BY YEAR(Bokforingsdag)', [sourceData]);

        var belopp = JSON.parse(JSON.stringify(result));

        return parseInt(belopp["0"].Belopp);
    }

    function getDepositsYearSumBelopp(year) {

        console.log(sourceData);

        var result = alasql('SELECT SUM(Belopp::NUMBER) AS Belopp \
                       FROM ? \
                       WHERE YEAR(Bokforingsdag) = ' + year + ' AND (Transaktionstyp = "UTTAG" AND Transaktionstyp = "INSATTNING" OR Transaktionstyp = "PREMIEINBETALNING")', [sourceData]);

        var belopp = JSON.parse(JSON.stringify(result));

        return parseInt(belopp["0"].Belopp);
    }

    function getTotalDividend() {
        return alasql('SELECT SUM(Belopp::NUMBER) AS Belopp \
                       FROM ? \
                       WHERE Transaktionstyp = "UTDELNING"', [sourceData]);
    }

    function getVardepapperTotalDividend() {
        return alasql('SELECT FIRST(Vardepapper) AS [name], ROUND(SUM(Belopp::NUMBER), 2) AS [value] \
                       FROM ? \
                       WHERE Transaktionstyp = "UTDELNING" \
                       GROUP BY Vardepapper', [sourceData]);
    }

    return {
        setSourceData: setSourceData,
        getDividendSumBelopp: getDividendSumBelopp,
        getDividendMaxYear: getDividendMaxYear,
        getDividendYears: getDividendYears,
        getDividendMonthSumBelopp: getDividendMonthSumBelopp,
        getDividendYearSumBelopp: getDividendYearSumBelopp,
        getTotalDividend: getTotalDividend,
        getVardepapperTotalDividend: getVardepapperTotalDividend,
        getTaxYearSumBelopp: getTaxYearSumBelopp,
        getDepositsYearSumBelopp: getDepositsYearSumBelopp,
        getDepositYears: getDepositYears
    };
});