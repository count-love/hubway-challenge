(function($) {
//---CONSTANTS
// when the map zoom level is less than MIN_ZOOM_DEFAULT_MARKER, enforce a minimum marker size
var MIN_ZOOM_DEFAULT_MARKER = 13;

//---GLOBALS
var map;
var Hubway = {};
var activeMarkers = {};
var activeStatistic;
var activeStation; // highlight a station
var clusters = {};
var cachedDataSource;
var cacheKey = '';
var illustrationCache = {"illustration_starts0startYear2016startMonthstartWeekdaystartHourstationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199membergender":{"trips":{"1":13.7,"2":12.4,"3":28.4,"4":28.8,"5":25.6,"6":7.8,"7":19.6,"8":21.6,"9":25.2,"10":93.8,"11":11.1,"12":25.8,"13":22.6,"14":15.1,"15":18.7,"16":8.5,"17":7.2,"18":26.6,"19":15.6,"20":0.1,"21":0.1,"22":0.2,"23":0.5,"24":0.3,"25":0.5,"26":0.1,"27":0.1,"28":0.2,"29":0.1,"30":27.6,"31":23.9,"32":26.2,"33":32.6,"34":39.5,"35":14,"36":23,"37":43.4,"38":41.4,"39":30.2,"40":21.1,"41":18.8,"42":16.1,"43":27.6,"44":51,"45":4.4,"46":35.8,"47":10.7,"48":13.9,"49":0.9,"50":0.7,"51":0.4,"52":2,"53":0.6,"54":0.3,"55":0.2,"56":0.2,"57":0.2,"58":26.8,"59":14.9,"60":23.2,"61":44.9,"62":2.3,"63":8.5,"64":27.5,"65":36,"66":38.1,"67":10,"68":28.8,"69":7.3,"70":4.6,"71":3.2,"72":1.5,"73":14.5,"74":12,"75":3.1,"76":1.5,"77":10.2,"78":13.1,"79":2.8,"80":9,"81":15.4,"82":19.4,"83":1.2,"84":14.8,"85":15,"86":1.3,"87":3.2,"88":14,"89":1.5,"90":4.2,"91":34.9,"92":3.9,"93":23.7,"94":27,"95":28.2,"96":49.8,"97":32.4,"98":41.8,"99":33,"100":23.2,"101":41.8,"102":22.9,"103":24,"104":25.6,"105":34.9,"106":23.7,"107":47.2,"108":42.8,"109":9,"110":31.3,"111":16.4,"112":34,"113":38.2,"114":16,"115":26.3,"116":7.4,"117":17.8,"118":5.9,"119":3.1,"120":0.6,"121":0.6,"122":7.3,"124":7.9,"125":3.1,"126":8.5,"127":11.1,"128":5.2,"129":18.6,"130":8.7,"131":9.6,"132":9.2,"133":35.9,"134":43.7,"135":31.8,"136":53.6,"137":63.1,"138":106.1,"139":34.1,"140":34.2,"141":39.2,"142":71.8,"143":42.5,"144":29.9,"145":30.8,"146":26.2,"147":35.1,"148":69,"149":27.2,"150":23.5,"151":28.2,"152":36.6,"153":25.6,"154":19.1,"155":16.5,"156":28.9,"157":21.3,"158":30.5,"159":18.3,"160":8.7,"161":19.8,"162":9.4,"163":18.8,"164":5.6,"165":42.9,"166":29.3,"167":9.9,"168":35,"169":45.3,"170":52,"171":7.2,"172":1.2,"173":2.3,"174":1.7,"175":3.2,"176":6.5,"177":16.5,"178":19.3,"179":17.3,"180":10.5,"181":31.2,"182":6.8,"183":5.1,"184":4.1,"185":9.6,"186":4.8,"187":4,"191":0.7,"199":0.2},"description":"<div class=\"results_title\">Average trips/day started from each station</div><div class=\"results_group\">Stations with the most trips:<br><ol><li>MIT at Mass Ave / Amherst St, 106.1 starts/day</li><li>South Station - 700 Atlantic Ave., 93.8 starts/day</li><li>Central Square at Mass Ave / Essex St, 71.8 starts/day</li><li>Harvard Square at Mass Ave/ Dunster, 69 starts/day</li><li>MIT Stata Center at Vassar St / Main St, 63.1 starts/day</li></ol></div><div class=\"results_group\">Stations with the fewest trips:<br><ol><li>Chelsea St at Saratoga St, 0.1 starts/day</li><li>Bennington St at Byron St, 0.1 starts/day</li><li>The Eddy at New Street, 0.1 starts/day</li><li>Glendon St at Condor St, 0.1 starts/day</li><li>Central Square East Boston - Porter Street at London Street, 0.1 starts/day</li></ol></div>"},"illustration_stops0startYear2016startMonthstartWeekdaystartHourstationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199membergender":{"trips":{"1":13.8,"2":12.4,"3":29.1,"4":29,"5":28.2,"6":8.4,"7":19.1,"8":22.6,"9":23.2,"10":94.7,"11":11.5,"12":24.4,"13":22.5,"14":12.8,"15":18.3,"16":7.9,"17":6.5,"18":33.9,"19":15.6,"20":0.1,"21":0.1,"22":0.3,"23":0.6,"24":0.3,"25":0.5,"26":0.1,"27":0.1,"28":0.3,"29":0,"30":26.8,"31":24.1,"32":26.3,"33":31.2,"34":39.6,"35":13.2,"36":21.7,"37":42.7,"38":42,"39":30.8,"40":21.6,"41":17.6,"42":14.5,"43":28.6,"44":46.8,"45":4.9,"46":34.8,"47":10.7,"48":13.8,"49":0.8,"50":0.8,"51":0.4,"52":2,"53":0.4,"54":0.3,"55":0.2,"56":0.2,"57":0.2,"58":26.5,"59":14.3,"60":23.3,"61":44.2,"62":2.1,"63":8.6,"64":27.6,"65":36.5,"66":37.9,"67":10.2,"68":30.9,"69":7.2,"70":4.9,"71":3,"72":1.3,"73":12.8,"74":12.4,"75":3.2,"76":1.2,"77":9.6,"78":12.9,"79":3.5,"80":9.9,"81":15.6,"82":19.7,"83":0.8,"84":14.9,"85":15,"86":1,"87":3.1,"88":13.7,"89":1.7,"90":4.3,"91":34.5,"92":4.1,"93":23.3,"94":27.3,"95":29.8,"96":50.5,"97":32.3,"98":43.5,"99":32,"100":23.6,"101":41.3,"102":23.3,"103":24.3,"104":25.9,"105":34.5,"106":24.8,"107":46.5,"108":43,"109":8.1,"110":31.8,"111":15.3,"112":31.3,"113":45.4,"114":17,"115":26.1,"116":7,"117":17.8,"118":5.1,"119":3.3,"120":0.6,"121":0.7,"122":7.4,"124":7.4,"125":2.9,"126":9.2,"127":10.9,"128":3.7,"129":19.3,"130":7.6,"131":8.9,"132":9.7,"133":36.8,"134":41,"135":28.5,"136":51.7,"137":88.2,"138":107.5,"139":32.6,"140":32,"141":36.3,"142":71,"143":41.7,"144":29,"145":27.9,"146":28.3,"147":35.8,"148":72.4,"149":29.8,"150":23.2,"151":28.2,"152":37,"153":25.7,"154":18.5,"155":15.8,"156":23.7,"157":20.4,"158":29.3,"159":17,"160":8.4,"161":19.9,"162":10.4,"163":18.7,"164":5.5,"165":44.2,"166":29.6,"167":11.5,"168":33,"169":42.3,"170":49.5,"171":7.5,"172":1.5,"173":1.8,"174":1.6,"175":2.5,"176":5.3,"177":17.1,"178":18.4,"179":16.7,"180":9.5,"181":36.1,"182":6.4,"183":5.1,"184":3,"185":6,"186":4.8,"187":4.1,"191":0.5,"199":0.7},"description":"<div class=\"results_title\">Number of trips ending at each station</div><div class=\"results_group\">Stations with the most trips:<br><ol><li>MIT at Mass Ave / Amherst St, 107.5 stops/day</li><li>South Station - 700 Atlantic Ave., 94.7 stops/day</li><li>MIT Stata Center at Vassar St / Main St, 88.2 stops/day</li><li>Harvard Square at Mass Ave/ Dunster, 72.4 stops/day</li><li>Central Square at Mass Ave / Essex St, 71 stops/day</li></ol></div><div class=\"results_group\">Stations with the fewest trips:<br><ol><li>Central Square East Boston - Porter Street at London Street, 0 stops/day</li><li>Chelsea St at Saratoga St, 0.1 stops/day</li><li>Bennington St at Byron St, 0.1 stops/day</li><li>The Eddy at New Street, 0.1 stops/day</li><li>Glendon St at Condor St, 0.1 stops/day</li></ol></div>"},"illustration_utilization7startYear2016startMonthstartWeekdaystartHourstationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199membergender":{"utilization":{"1":0.07,"2":0.064,"3":0.116,"4":0.202,"5":0.138,"6":0.042,"7":0.099,"8":0.113,"9":0.124,"10":0.158,"11":0.058,"12":0.102,"13":0.091,"14":0.072,"15":0.079,"16":0.042,"17":0.029,"18":0.063,"19":0.063,"20":0,"21":0.001,"22":0.001,"23":0.001,"24":0.001,"25":0.003,"26":0.001,"27":0.001,"28":0.001,"29":0,"30":0.116,"31":0.123,"32":0.096,"33":0.129,"34":0.16,"35":0.07,"36":0.091,"37":0.158,"38":0.214,"39":0.124,"40":0.109,"41":0.093,"42":0.078,"43":0.197,"44":0.198,"45":0.024,"46":0.181,"47":0.055,"48":0.076,"49":0.006,"50":0.004,"51":0.002,"52":0.01,"53":0.003,"54":0.002,"55":0.001,"56":0.001,"57":0.001,"58":0.137,"59":0.075,"60":0.094,"61":0.18,"62":0.015,"63":0.044,"64":0.112,"65":0.112,"66":0.154,"67":0.052,"68":0.121,"69":0.037,"70":0.024,"71":0.013,"72":0.007,"73":0.062,"74":0.063,"75":0.013,"76":0.007,"77":0.045,"78":0.053,"79":0.016,"80":0.038,"81":0.063,"82":0.1,"83":0.005,"84":0.063,"85":0.064,"86":0.006,"87":0.016,"88":0.076,"89":0.009,"90":0.022,"91":0.178,"92":0.021,"93":0.121,"94":0.077,"95":0.097,"96":0.154,"97":0.166,"98":0.149,"99":0.167,"100":0.095,"101":0.177,"102":0.094,"103":0.098,"104":0.132,"105":0.178,"106":0.124,"107":0.24,"108":0.22,"109":0.034,"110":0.162,"111":0.111,"112":0.132,"113":0.095,"114":0.067,"115":0.134,"116":0.029,"117":0.091,"118":0.027,"119":0.017,"120":0.003,"121":0.003,"122":0.038,"124":0.039,"125":0.015,"126":0.045,"127":0.045,"128":0.023,"129":0.077,"130":0.042,"131":0.047,"132":0.048,"133":0.147,"134":0.171,"135":0.155,"136":0.176,"137":0.166,"138":0.304,"139":0.171,"140":0.17,"141":0.153,"142":0.289,"143":0.191,"144":0.119,"145":0.151,"146":0.091,"147":0.182,"148":0.286,"149":0.146,"150":0.094,"151":0.145,"152":0.149,"153":0.116,"154":0.076,"155":0.065,"156":0.107,"157":0.084,"158":0.121,"159":0.071,"160":0.039,"161":0.102,"162":0.033,"163":0.063,"164":0.023,"165":0.176,"166":0.119,"167":0.055,"168":0.138,"169":0.177,"170":0.156,"171":0.03,"172":0.004,"173":0.008,"174":0.008,"175":0.009,"176":0.03,"177":0.068,"178":0.097,"179":0.087,"180":0.051,"181":0.103,"182":0.034,"183":0.026,"184":0.018,"185":0.04,"186":0.025,"187":0.021,"191":0.003,"199":0},"description":"<div class=\"results_title\">Capacity utilization</div><div class=\"results_group\">(utilization estimated as a percentage of the peak observed hourly number of start+stops)<br><ol><li>MIT at Mass Ave / Amherst St, 0.304 trips/dock-hour</li><li>Central Square at Mass Ave / Essex St, 0.289 trips/dock-hour</li><li>Harvard Square at Mass Ave/ Dunster, 0.286 trips/dock-hour</li><li>Charles Circle - Charles St. at Cambridge St., 0.24 trips/dock-hour</li><li>The Esplanade - Beacon St. at Arlington St., 0.22 trips/dock-hour</li></ol></div>","clusters":{"1":4,"2":4,"3":6,"4":5,"5":1,"6":4,"7":6,"8":6,"9":6,"10":1,"11":4,"12":6,"13":6,"14":4,"15":4,"16":4,"17":0,"18":4,"19":4,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":6,"31":6,"32":6,"33":1,"34":1,"35":4,"36":6,"37":1,"38":5,"39":6,"40":6,"41":6,"42":4,"43":3,"44":3,"45":0,"46":3,"47":4,"48":4,"49":0,"50":0,"51":0,"52":0,"53":0,"54":0,"55":0,"56":0,"57":0,"58":1,"59":4,"60":6,"61":3,"62":0,"63":4,"64":6,"65":6,"66":1,"67":4,"68":6,"69":4,"70":0,"71":0,"72":0,"73":4,"74":4,"75":0,"76":0,"77":4,"78":4,"79":0,"80":4,"81":4,"82":6,"83":0,"84":4,"85":4,"86":0,"87":0,"88":4,"89":0,"90":0,"91":3,"92":0,"93":6,"94":4,"95":6,"96":1,"97":3,"98":1,"99":3,"100":6,"101":3,"102":6,"103":6,"104":1,"105":3,"106":6,"107":5,"108":5,"109":0,"110":1,"111":6,"112":1,"113":6,"114":4,"115":1,"116":0,"117":6,"118":0,"119":0,"120":0,"121":0,"122":4,"124":4,"125":0,"126":4,"127":4,"128":0,"129":4,"130":4,"131":4,"132":4,"133":1,"134":3,"135":1,"136":3,"137":3,"138":2,"139":3,"140":3,"141":1,"142":2,"143":3,"144":6,"145":1,"146":6,"147":3,"148":2,"149":1,"150":6,"151":1,"152":1,"153":6,"154":4,"155":4,"156":6,"157":6,"158":6,"159":4,"160":4,"161":6,"162":0,"163":4,"164":0,"165":3,"166":6,"167":4,"168":1,"169":3,"170":1,"171":0,"172":0,"173":0,"174":0,"175":0,"176":0,"177":4,"178":6,"179":6,"180":4,"181":6,"182":0,"183":0,"184":0,"185":4,"186":0,"187":0,"191":0,"199":0},"clusterMeans":[[0.012105263157894744],[0.1471363636363636],[0.293],[0.17788888888888887],[0.05822222222222224],[0.219],[0.1051794871794872]],"clusterMeansSorted":[0.012105263157894744,0.05822222222222224,0.1051794871794872,0.1471363636363636,0.17788888888888887,0.219,0.293],"clusterMeansOriginalArray":[0.012105263157894744,0.1471363636363636,0.293,0.17788888888888887,0.05822222222222224,0.219,0.1051794871794872]},"illustration_popular-routes0startYear2016startMonthstartWeekdaystartHourstationStart47membergender":{"direction":{"47":["5","32","137","115","18"]},"description":"<div class=\"results_title\">Most frequent stops from selected start stations</div><div class=\"results_group\"><strong>From:</strong> BIDMC - Brookline at Burlington St<br><ol><li>Longwood Ave / Binney St, 411 trips</li><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 127 trips</li><li>MIT Stata Center at Vassar St / Main St, 100 trips</li><li>Charles St at Beacon St, 97 trips</li><li>Nashua Street at Red Auerbach Way, 95 trips</li></ol></div>"},"illustration_utilization0startYear2016startMonth1212startWeekdaystartHourstationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199membergender":{"utilization":{"1":0.013,"2":0.012,"3":0.017,"4":0.024,"5":0.022,"6":0.006,"7":0.018,"8":0.022,"9":0.017,"10":0.029,"11":0.011,"12":0.016,"13":0.017,"14":0,"15":0.012,"16":0.007,"17":0.007,"18":0.021,"19":0.01,"20":0,"21":0,"22":0,"23":0.001,"24":0.001,"25":0.001,"26":0.001,"27":0,"28":0,"29":0,"30":0,"31":0.019,"32":0.015,"33":0.019,"34":0.025,"35":0.01,"36":0.01,"37":0.025,"38":0.041,"39":0,"40":0.019,"41":0.015,"42":0.013,"43":0.038,"44":0,"45":0.003,"46":0,"47":0,"48":0.011,"49":0.002,"50":0.001,"51":0,"52":0.004,"53":0.001,"54":0.001,"55":0,"56":0,"57":0,"58":0.024,"59":0.017,"60":0,"61":0.032,"62":0.021,"63":0.007,"64":0.025,"65":0.024,"66":0,"67":0.005,"68":0,"69":0,"70":0.003,"71":0.002,"72":0,"73":0.012,"74":0.007,"75":0,"76":0.001,"77":0.009,"78":0.009,"79":0.003,"80":0.002,"81":0.01,"82":0.015,"83":0,"84":0.009,"85":0.01,"86":0,"87":0,"88":0.009,"89":0.002,"90":0.024,"91":0.033,"92":0.002,"93":0,"94":0,"95":0,"96":0.037,"97":0.025,"98":0.015,"99":0.034,"100":0.011,"101":0.026,"102":0.01,"103":0,"104":0,"105":0.022,"106":0.018,"107":0,"108":0.028,"109":0.004,"110":0.021,"111":0.02,"112":0.018,"113":0.004,"114":0.012,"115":0,"116":0,"117":0,"118":0.005,"119":0.002,"120":0.001,"121":0.002,"122":0.003,"124":0,"125":0.002,"126":0.007,"127":0.008,"128":0.005,"129":0.003,"130":0.001,"131":0.003,"132":0.002,"133":0.051,"134":0.074,"135":0.082,"136":0.039,"137":0.079,"138":0.132,"139":0.082,"140":0.058,"141":0.086,"142":0.133,"143":0.077,"144":0.05,"145":0.085,"146":0.034,"147":0.063,"148":0.088,"149":0.052,"150":0.037,"151":0.062,"152":0.07,"153":0.06,"154":0.032,"155":0.029,"156":0.061,"157":0.033,"158":0.051,"159":0.016,"160":0.012,"161":0.034,"162":0.013,"163":0.026,"164":0.01,"165":0.085,"166":0.03,"167":0.022,"168":0.057,"169":0.091,"170":0.071,"171":0.012,"172":0.003,"173":0.011,"174":0.013,"175":0.002,"176":0.005,"177":0.011,"178":0.007,"179":0.017,"180":0.002,"181":0.019,"182":0.008,"183":0.002,"184":0.002,"185":0.003,"186":0.003,"187":0.001,"191":0,"199":0},"description":"<div class=\"results_title\">Capacity utilization</div><div class=\"results_group\">(utilization estimated as a percentage of the peak observed hourly number of start+stops)<br><ol><li>Central Square at Mass Ave / Essex St, 0.133 trips/dock-hour</li><li>MIT at Mass Ave / Amherst St, 0.132 trips/dock-hour</li><li>MIT Pacific St at Purrington St, 0.091 trips/dock-hour</li><li>Harvard Square at Mass Ave/ Dunster, 0.088 trips/dock-hour</li><li>Inman Square at Vellucci Plaza / Hampshire St, 0.086 trips/dock-hour</li></ol></div>"},"illustration_duration0startYear2016startMonthstartWeekdaystartHourstationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199member1gender":{"duration":{"1":11.5,"2":16.8,"3":13.4,"4":13.8,"5":14,"6":14.4,"7":12,"8":13.7,"9":11.4,"10":10.9,"11":12.3,"12":15.6,"13":10.1,"14":16,"15":12.8,"16":14.7,"17":12.9,"18":13.8,"19":10.3,"20":10.7,"21":13.2,"22":21.1,"23":20.6,"24":22.4,"25":18.3,"26":8.8,"27":14,"28":25.4,"29":2.4,"30":12.4,"31":12.1,"32":13.6,"33":11.9,"34":13.4,"35":13.8,"36":11.2,"37":12.6,"38":12.7,"39":13.9,"40":13.5,"41":13.8,"42":11.6,"43":13.4,"44":11.1,"45":16.5,"46":11.6,"47":14.1,"48":15.1,"49":14.6,"50":15.2,"51":15.4,"52":13.8,"53":15.6,"54":19.8,"55":24.8,"56":19.3,"57":24.1,"58":11.2,"59":12.4,"60":13.3,"61":12.7,"62":11.3,"63":14.5,"64":11.7,"65":12.9,"66":12.1,"67":11.3,"68":10.2,"69":12.4,"70":19.1,"71":19.8,"72":16.2,"73":11.9,"74":15.2,"75":16,"76":18.6,"77":14.4,"78":13.3,"79":16.1,"80":20.6,"81":10.8,"82":9.5,"83":31.9,"84":12,"85":10.9,"86":37.1,"87":18.5,"88":10.9,"89":22.5,"90":9.8,"91":13.3,"92":21,"93":10.6,"94":13.3,"95":11.3,"96":13.2,"97":11.2,"98":13.2,"99":10.3,"100":13.7,"101":12.6,"102":12.3,"103":10.9,"104":11.1,"105":15.1,"106":11.3,"107":13.4,"108":17.5,"109":11.8,"110":13.1,"111":13.7,"112":13.7,"113":13,"114":15.1,"115":13.8,"116":16.2,"117":12.4,"118":18.8,"119":20.6,"120":17.9,"121":22.2,"122":20.4,"124":16.3,"125":17.4,"126":19.4,"127":15.4,"128":14,"129":14.3,"130":16.5,"131":14.9,"132":16.1,"133":12.3,"134":11.8,"135":12.1,"136":10.1,"137":9.3,"138":9.7,"139":11.4,"140":10.4,"141":10.3,"142":9.6,"143":10.9,"144":11.1,"145":10.2,"146":12.8,"147":13,"148":12.9,"149":12.8,"150":11.1,"151":10.9,"152":12.3,"153":11.1,"154":10.5,"155":9.6,"156":10.4,"157":11.8,"158":12.6,"159":11.3,"160":14.3,"161":12.6,"162":20.9,"163":13.5,"164":14.1,"165":10.8,"166":13.3,"167":13.2,"168":9.5,"169":7.8,"170":8.3,"171":14.7,"172":21.5,"173":9.7,"174":10.2,"175":12.5,"176":14.1,"177":14,"178":11.2,"179":13.2,"180":12.1,"181":9.5,"182":14.3,"183":12.1,"184":13.2,"185":6.6,"186":13,"187":17.2,"191":19.7,"199":33},"description":"<div class=\"results_title\">Average duration of trips started at each station</div><div class=\"results_group\">Stations with the longest average trip:<br><ol><li>Franklin Park Zoo, 37.1 minutes</li><li>18 Dorrance Warehouse, 33 minutes</li><li>Franklin Park - Seaver Street at Humbolt Ave, 31.9 minutes</li><li>Orient Heights T Stop - Bennington St at Saratoga St, 25.4 minutes</li><li>Columbia Rd at Ceylon St, 24.8 minutes</li></ol></div><div class=\"results_group\">Stations with the shortest average trip:<br><ol><li>Central Square East Boston - Porter Street at London Street, 2.4 minutes</li><li>Teele Square at 239 Holland St, 6.6 minutes</li><li>MIT Pacific St at Purrington St, 7.8 minutes</li><li>MIT Vassar St, 8.3 minutes</li><li>The Eddy at New Street, 8.8 minutes</li></ol></div>"},"illustration_duration0startYear2016startMonthstartWeekdaystartHourstationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199member0gender":{"duration":{"1":27,"2":29.3,"3":27.3,"4":25.2,"5":23,"6":29.3,"7":25.9,"8":23.6,"9":20.2,"10":18.7,"11":21.8,"12":28.4,"13":23.3,"14":28.3,"15":28.7,"16":17.6,"17":24.1,"18":24.1,"19":22.9,"20":52.7,"21":54.3,"22":30.6,"23":53.1,"24":42.8,"25":43,"26":26.3,"27":49.3,"28":71,"29":24.3,"30":28.7,"31":23.8,"32":24.6,"33":26.6,"34":24.4,"35":26.1,"36":24.4,"37":25.5,"38":27.7,"39":26.6,"40":25.7,"41":29.3,"42":24.5,"43":26.6,"44":23.7,"45":23.3,"46":23,"47":28.7,"48":25.3,"49":32.9,"50":19.7,"51":32,"52":29.5,"53":35.1,"54":15.9,"55":62.5,"56":51.4,"57":37.4,"58":22.2,"59":18.8,"60":23.5,"61":22.7,"62":23.5,"63":19.1,"64":20,"65":25.8,"66":25.9,"67":20.6,"68":21.8,"69":23.3,"70":41.8,"71":40.6,"72":36.4,"73":25.6,"74":28.1,"75":25.5,"76":30.3,"77":19.9,"78":22.3,"79":19.6,"80":35.1,"81":21.2,"82":20.4,"83":44,"84":26.8,"85":24.5,"86":45,"87":33.6,"88":24.7,"89":44.8,"90":24.5,"91":25.8,"92":36.1,"93":18.3,"94":22.2,"95":22.9,"96":32,"97":24.8,"98":30,"99":21.8,"100":26.3,"101":26.8,"102":23.8,"103":22.4,"104":26.8,"105":26.6,"106":22.2,"107":28.2,"108":32.5,"109":27.5,"110":25.6,"111":22.9,"112":24.9,"113":23.6,"114":22.1,"115":29.3,"116":27.5,"117":25.9,"118":32.1,"119":61.8,"120":39.1,"121":56.7,"122":41.5,"124":27.2,"125":27.1,"126":28.7,"127":25.1,"128":30.7,"129":33.6,"130":30.6,"131":24.5,"132":31.4,"133":24.1,"134":17.9,"135":19.6,"136":22.5,"137":21.4,"138":22.3,"139":16.8,"140":20.5,"141":16,"142":17.9,"143":17.9,"144":21.3,"145":17.7,"146":30.1,"147":28.4,"148":27.7,"149":20.8,"150":21.1,"151":24.6,"152":20.3,"153":19.5,"154":16.3,"155":26.2,"156":14.9,"157":16.8,"158":18.7,"159":20.3,"160":29.6,"161":21.3,"162":30,"163":24.8,"164":24.4,"165":22.7,"166":28.8,"167":24.7,"168":20.6,"169":18.1,"170":21.8,"171":24.5,"172":64.3,"173":20,"174":16.9,"175":27.8,"176":22.5,"177":21.9,"178":18.9,"179":19.9,"180":24.2,"181":26,"182":34.5,"183":18.2,"184":27.2,"185":30.8,"186":28.5,"187":37.5,"191":33.3,"199":3.5},"description":"<div class=\"results_title\">Average duration of trips started at each station</div><div class=\"results_group\">Stations with the longest average trip:<br><ol><li>Orient Heights T Stop - Bennington St at Saratoga St, 71 minutes</li><li>Alewife MBTA at Steel Place, 64.3 minutes</li><li>Columbia Rd at Ceylon St, 62.5 minutes</li><li>Washington St at Brock St, 61.8 minutes</li><li>Oak Square YMCA, 56.7 minutes</li></ol></div><div class=\"results_group\">Stations with the shortest average trip:<br><ol><li>18 Dorrance Warehouse, 3.5 minutes</li><li>359 Broadway - Broadway at Fayette Street, 14.9 minutes</li><li>Grove Hall Library, 15.9 minutes</li><li>Inman Square at Vellucci Plaza / Hampshire St, 16 minutes</li><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 16.3 minutes</li></ol></div>"},"illustration_distance-min0startYear2016startMonthstartWeekdaystartHourstationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199membergender":{"min":{"1":227,"2":589,"3":606,"4":433,"5":342,"6":760,"7":443,"8":413,"9":387,"10":332,"11":378,"12":685,"13":174,"14":511,"15":378,"16":501,"17":326,"18":41,"19":290,"20":364,"21":892,"22":586,"23":95,"24":95,"25":585,"26":431,"27":364,"28":892,"29":533,"30":245,"31":671,"32":342,"33":185,"34":358,"35":352,"36":144,"37":190,"38":447,"39":286,"40":424,"41":397,"42":245,"43":235,"44":410,"45":514,"46":245,"47":235,"48":449,"49":682,"50":534,"51":495,"52":295,"53":559,"54":608,"55":677,"56":518,"57":677,"58":437,"59":718,"60":245,"61":187,"62":398,"63":295,"64":245,"65":312,"66":280,"67":370,"68":324,"69":904,"70":562,"71":1139,"72":746,"73":584,"74":584,"75":372,"76":372,"77":238,"78":238,"79":746,"80":1020,"81":370,"82":529,"83":841,"84":300,"85":565,"86":608,"87":549,"88":335,"89":812,"90":144,"91":481,"92":355,"93":437,"94":360,"95":271,"96":97,"97":444,"98":207,"99":174,"100":190,"101":267,"102":207,"103":271,"104":255,"105":293,"106":293,"107":481,"108":253,"109":245,"110":293,"111":406,"112":551,"113":41,"114":649,"115":253,"116":649,"117":97,"118":830,"119":521,"120":355,"121":521,"122":687,"124":778,"125":559,"126":687,"127":711,"128":719,"129":696,"130":972,"131":511,"132":719,"133":401,"134":436,"135":77,"136":77,"137":325,"138":443,"139":586,"140":108,"141":433,"142":244,"143":244,"144":410,"145":375,"146":176,"147":176,"148":189,"149":411,"150":275,"151":291,"152":664,"153":275,"154":451,"155":569,"156":433,"157":306,"158":145,"159":551,"160":525,"161":192,"162":261,"163":295,"164":525,"165":263,"166":375,"167":145,"168":108,"169":293,"170":245,"171":904,"172":261,"173":245,"174":206,"175":295,"176":833,"177":738,"178":577,"179":528,"180":484,"181":622,"182":669,"183":344,"184":661,"185":344,"186":790,"187":1122,"191":470,"199":219},"description":"<div class=\"results_title\">Minimum Distance Traveled</div><div class=\"results_group\">Fan Pier: 227 meters</div><div class=\"results_group\">Union Square - Brighton Ave. at Cambridge St.: 589 meters</div><div class=\"results_group\">Agganis Arena - 925 Comm Ave.: 606 meters</div><div class=\"results_group\">B.U. Central - 725 Comm. Ave.: 433 meters</div><div class=\"results_group\">Longwood Ave / Binney St: 342 meters</div><div class=\"results_group\">Harvard Real Estate - Brighton Mills - 370 Western Ave: 760 meters</div><div class=\"results_group\">Harvard University Housing - 111 Western Ave. at Soldiers Field Park : 443 meters</div><div class=\"results_group\">Buswell St. at Park Dr.: 413 meters</div><div class=\"results_group\">Tremont St / W Newton St: 387 meters</div><div class=\"results_group\">South Station - 700 Atlantic Ave.: 332 meters</div><div class=\"results_group\">Innovation Lab - 125 Western Ave. at Batten Way: 378 meters</div><div class=\"results_group\">Packard's Corner - Comm. Ave. at Brighton Ave.: 685 meters</div><div class=\"results_group\">John F Fitzgerald - Surface Road at India Street: 174 meters</div><div class=\"results_group\">Allston Green District - Commonwealth Ave & Griggs St: 511 meters</div><div class=\"results_group\">Harvard University Transportation Services - 175 North Harvard St: 378 meters</div><div class=\"results_group\">Edwards Playground - Main Street & Eden Street: 501 meters</div><div class=\"results_group\">Bunker Hill Community College: 326 meters</div><div class=\"results_group\">Nashua Street at Red Auerbach Way: 41 meters</div><div class=\"results_group\">Purchase St at Pearl St: 290 meters</div><div class=\"results_group\">Chelsea St at Saratoga St: 364 meters</div><div class=\"results_group\">Bennington St at Byron St: 892 meters</div><div class=\"results_group\">Piers Park- Marginal St at East Boston Shipyard: 586 meters</div><div class=\"results_group\">Maverick Sq - Lewis Mall: 95 meters</div><div class=\"results_group\">EBNHC - 20 Maverick Sq: 95 meters</div><div class=\"results_group\">Airport T Stop - Bremen St at Brooks St: 585 meters</div><div class=\"results_group\">The Eddy at New Street: 431 meters</div><div class=\"results_group\">Glendon St at Condor St: 364 meters</div><div class=\"results_group\">Orient Heights T Stop - Bennington St at Saratoga St: 892 meters</div><div class=\"results_group\">Central Square East Boston - Porter Street at London Street: 533 meters</div><div class=\"results_group\">Newbury St / Hereford St: 245 meters</div><div class=\"results_group\">Ruggles Station / Columbus Ave.: 671 meters</div><div class=\"results_group\">HMS / HSPH - Ave. Louis Pasteur at Longwood Ave.: 342 meters</div><div class=\"results_group\">Aquarium Station - 200 Atlantic Ave.: 185 meters</div><div class=\"results_group\">Christian Science Plaza: 358 meters</div><div class=\"results_group\">Colleges of the Fenway: 352 meters</div><div class=\"results_group\">Seaport Square - Seaport Blvd. at Boston Wharf: 144 meters</div><div class=\"results_group\">Mayor Martin J Walsh - 28 State St: 190 meters</div><div class=\"results_group\">Kenmore Sq / Comm Ave: 447 meters</div><div class=\"results_group\">Yawkey Way at Boylston St.: 286 meters</div><div class=\"results_group\">Northeastern U / North Parking Lot: 424 meters</div><div class=\"results_group\">Brigham Cir / Huntington Ave: 397 meters</div><div class=\"results_group\">Seaport Hotel: 245 meters</div><div class=\"results_group\">Landmark Centre: 235 meters</div><div class=\"results_group\">Beacon St / Mass Ave: 410 meters</div><div class=\"results_group\">Dudley Square: 514 meters</div><div class=\"results_group\">Boylston / Mass Ave: 245 meters</div><div class=\"results_group\">BIDMC - Brookline at Burlington St: 235 meters</div><div class=\"results_group\">Wentworth Institute of Technology: 449 meters</div><div class=\"results_group\">Roxbury YMCA: 682 meters</div><div class=\"results_group\">MLK Blvd at Washington St: 534 meters</div><div class=\"results_group\">Upham's Corner T Stop: 495 meters</div><div class=\"results_group\">Washington St at Melnea Cass Blvd: 295 meters</div><div class=\"results_group\">Walnut Ave at Crawford St: 559 meters</div><div class=\"results_group\">Grove Hall Library: 608 meters</div><div class=\"results_group\">Columbia Rd at Ceylon St: 677 meters</div><div class=\"results_group\">Walnut Ave at Warren St: 518 meters</div><div class=\"results_group\">Bowdoin St at Quincy St: 677 meters</div><div class=\"results_group\">Tremont St. at Berkeley St.: 437 meters</div><div class=\"results_group\">Roxbury Crossing Station: 718 meters</div><div class=\"results_group\">Boston Medical Center - East Concord at Harrison Ave: 245 meters</div><div class=\"results_group\">Back Bay / South End Station: 187 meters</div><div class=\"results_group\">Columbus Ave. at Mass. Ave.: 398 meters</div><div class=\"results_group\">Washington St. at Lenox St.: 295 meters</div><div class=\"results_group\">Washington St. at Rutland St.: 245 meters</div><div class=\"results_group\">Prudential Center / Belvidere: 312 meters</div><div class=\"results_group\">Boylston at Fairfield: 280 meters</div><div class=\"results_group\">Dorchester Ave. at Gillette Park: 370 meters</div><div class=\"results_group\">Congress / Sleeper: 324 meters</div><div class=\"results_group\">Andrew Station - Dorchester Ave at Humboldt Pl: 904 meters</div><div class=\"results_group\">JFK / UMASS at MBTA Station: 562 meters</div><div class=\"results_group\">UMass Boston Integrated Sciences Complex: 1139 meters</div><div class=\"results_group\">Mt Pleasant Ave / Dudley Town Common: 746 meters</div><div class=\"results_group\">West Broadway at Dorchester St: 584 meters</div><div class=\"results_group\">South Boston Library - 646 East Broadway: 584 meters</div><div class=\"results_group\">E. Cottage St at Columbia Rd: 372 meters</div><div class=\"results_group\">Upham's Corner - Columbia Rd: 372 meters</div><div class=\"results_group\">ID Building East: 238 meters</div><div class=\"results_group\">ID Building West: 238 meters</div><div class=\"results_group\">Mass Ave at Newmarket Square: 746 meters</div><div class=\"results_group\">Day Boulevard: 1020 meters</div><div class=\"results_group\">State Street at Channel Center: 370 meters</div><div class=\"results_group\">Ink Block: 529 meters</div><div class=\"results_group\">Franklin Park - Seaver Street at Humbolt Ave: 841 meters</div><div class=\"results_group\">Lawn on D: 300 meters</div><div class=\"results_group\">West Broadway at D Street: 565 meters</div><div class=\"results_group\">Franklin Park Zoo: 608 meters</div><div class=\"results_group\">Ryan Playground - Dorchester Avenue Station: 549 meters</div><div class=\"results_group\">Congress St and Northern Ave: 335 meters</div><div class=\"results_group\">Savin Hill MBTA Station: 812 meters</div><div class=\"results_group\">Watermark Seaport: 144 meters</div><div class=\"results_group\">Cambridge St. at Joy St.: 481 meters</div><div class=\"results_group\">New Balance - 20 Guest St.: 355 meters</div><div class=\"results_group\">Washington St. at Waltham St.: 437 meters</div><div class=\"results_group\">TD Garden - Causeway at Portal Park #2: 360 meters</div><div class=\"results_group\">Franklin St. / Arch St.: 271 meters</div><div class=\"results_group\">Boston Public Library - 700 Boylston St.: 97 meters</div><div class=\"results_group\">Lewis Wharf - Atlantic Ave.: 444 meters</div><div class=\"results_group\">Boylston St. at Arlington St.: 207 meters</div><div class=\"results_group\">Rowes Wharf - Atlantic Ave: 174 meters</div><div class=\"results_group\">Faneuil Hall - Union St. at North St.: 190 meters</div><div class=\"results_group\">Cross St. at Hanover St.: 267 meters</div><div class=\"results_group\">Stuart St. at Charles St.: 207 meters</div><div class=\"results_group\">Post Office Square: 271 meters</div><div class=\"results_group\">Boylston St / Berkeley St: 255 meters</div><div class=\"results_group\">Tremont St / West St: 293 meters</div><div class=\"results_group\">Chinatown Gate Plaza - Surface Rd. at Beach St.: 293 meters</div><div class=\"results_group\">Charles Circle - Charles St. at Cambridge St.: 481 meters</div><div class=\"results_group\">The Esplanade - Beacon St. at Arlington St.: 253 meters</div><div class=\"results_group\">Boston Convention & Exhibition Center: 245 meters</div><div class=\"results_group\">Boylston St / Washington St: 293 meters</div><div class=\"results_group\">Charlestown - Main St at Austin St: 406 meters</div><div class=\"results_group\">Charlestown - Warren St at Chelsea St: 551 meters</div><div class=\"results_group\">TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1): 41 meters</div><div class=\"results_group\">Spaulding Rehabilitation Hospital - Charlestown Navy Yard: 649 meters</div><div class=\"results_group\">Charles St at Beacon St: 253 meters</div><div class=\"results_group\">Hayes Square at Vine St.: 649 meters</div><div class=\"results_group\">New Balance Store - Boylston at Dartmouth: 97 meters</div><div class=\"results_group\">Brighton Center: 830 meters</div><div class=\"results_group\">Washington St at Brock St: 521 meters</div><div class=\"results_group\">Market St at Faneuil St: 355 meters</div><div class=\"results_group\">Oak Square YMCA: 521 meters</div><div class=\"results_group\">Curtis Hall at South Street: 687 meters</div><div class=\"results_group\">JP Center - Centre Street at Myrtle Street: no rides during this period</div><div class=\"results_group\">Hyde Square at Barbara St: 778 meters</div><div class=\"results_group\">Egleston Square at Columbus Ave: 559 meters</div><div class=\"results_group\">Green St T: 687 meters</div><div class=\"results_group\">Jackson Square T at Centre St: 711 meters</div><div class=\"results_group\">Heath St at South Huntington: 719 meters</div><div class=\"results_group\">Coolidge Corner - Beacon St @ Centre St: 696 meters</div><div class=\"results_group\">Washington Square at Washington St. / Beacon St.: 972 meters</div><div class=\"results_group\">JFK Crossing at Harvard St. / Thorndike St.: 511 meters</div><div class=\"results_group\">Brookline Village - Station Street @ MBTA: 719 meters</div><div class=\"results_group\">Lechmere Station at Cambridge St / First St: 401 meters</div><div class=\"results_group\">One Kendall Square at Hampshire St / Portland St: 436 meters</div><div class=\"results_group\">One Broadway / Kendall Sq at Main St / 3rd St: 77 meters</div><div class=\"results_group\">Kendall T: 77 meters</div><div class=\"results_group\">MIT Stata Center at Vassar St / Main St: 325 meters</div><div class=\"results_group\">MIT at Mass Ave / Amherst St: 443 meters</div><div class=\"results_group\">Cambridge St - at Columbia St / Webster Ave: 586 meters</div><div class=\"results_group\">Lafayette Square at Mass Ave / Main St / Columbia St: 108 meters</div><div class=\"results_group\">Inman Square at Vellucci Plaza / Hampshire St: 433 meters</div><div class=\"results_group\">Central Square at Mass Ave / Essex St: 244 meters</div><div class=\"results_group\">Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St: 244 meters</div><div class=\"results_group\">Cambridge Main Library at Broadway / Trowbridge St: 410 meters</div><div class=\"results_group\">Harvard University Housing - 115 Putnam Ave at Peabody Terrace: 375 meters</div><div class=\"results_group\">Harvard Kennedy School at Bennett St / Eliot St: 176 meters</div><div class=\"results_group\">Harvard Square at Brattle St / Eliot St: 176 meters</div><div class=\"results_group\">Harvard Square at Mass Ave/ Dunster: 189 meters</div><div class=\"results_group\">CambridgeSide Galleria - CambridgeSide PL at Land Blvd: 411 meters</div><div class=\"results_group\">Harvard Law School at Mass Ave / Jarvis St: 275 meters</div><div class=\"results_group\">Harvard University Gund Hall at Quincy St / Kirkland S: 291 meters</div><div class=\"results_group\">Lower Cambridgeport at Magazine St/Riverside Rd: 664 meters</div><div class=\"results_group\">Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St: 275 meters</div><div class=\"results_group\">Harvard University Radcliffe Quadrangle at Shepard St / Garden St: 451 meters</div><div class=\"results_group\">Linear Park - Mass. Ave. at Cameron Ave. : 569 meters</div><div class=\"results_group\">359 Broadway - Broadway at Fayette Street: 433 meters</div><div class=\"results_group\">Binney St / Sixth St: 306 meters</div><div class=\"results_group\">Porter Square Station: 145 meters</div><div class=\"results_group\">Dana Park: 551 meters</div><div class=\"results_group\">Danehy Park: 525 meters</div><div class=\"results_group\">Kendall Street: 192 meters</div><div class=\"results_group\">Alewife Station at Russell Field: 261 meters</div><div class=\"results_group\">EF - North Point Park: 295 meters</div><div class=\"results_group\">Rindge Avenue - O'Neill Library: 525 meters</div><div class=\"results_group\">Ames St at Main St: 263 meters</div><div class=\"results_group\">Harvard University River Houses at DeWolfe St / Cowperthwaite St: 375 meters</div><div class=\"results_group\">Lesley University: 145 meters</div><div class=\"results_group\">University Park: 108 meters</div><div class=\"results_group\">MIT Pacific St at Purrington St: 293 meters</div><div class=\"results_group\">MIT Vassar St: 245 meters</div><div class=\"results_group\">Mt Auburn: 904 meters</div><div class=\"results_group\">Alewife MBTA at Steel Place: 261 meters</div><div class=\"results_group\">Sidney Research Campus/ Erie Street at Waverly: 245 meters</div><div class=\"results_group\">Third at Binney: 206 meters</div><div class=\"results_group\">Brian P. Murphy Staircase at Child Street: 295 meters</div><div class=\"results_group\">Somerville City Hall: 833 meters</div><div class=\"results_group\">Union Square - Somerville: 738 meters</div><div class=\"results_group\">Beacon St at Washington / Kirkland: 577 meters</div><div class=\"results_group\">Conway Park - Somerville Avenue: 528 meters</div><div class=\"results_group\">Wilson Square: 484 meters</div><div class=\"results_group\">Davis Square: 622 meters</div><div class=\"results_group\">Powder House Circle - Nathan Tufts Park: 669 meters</div><div class=\"results_group\">Packard Ave / Powderhouse Blvd: 344 meters</div><div class=\"results_group\">Somerville Hospital at Highland Ave / Crocker St: 661 meters</div><div class=\"results_group\">Teele Square at 239 Holland St: 344 meters</div><div class=\"results_group\">Magoun Square at Trum Field: 790 meters</div><div class=\"results_group\">Broadway St at Mt Pleasant St: 1122 meters</div><div class=\"results_group\">Brookline Village - Station Street @ MBTA: no rides during this period</div><div class=\"results_group\">Summer St at Cutter St: no rides during this period</div><div class=\"results_group\">Brookline Village - Pearl Street @ MBTA: no rides during this period</div><div class=\"results_group\">Upham's Corner - Ramsey St at Dudley St: 470 meters</div><div class=\"results_group\">Harvard Real Estate - 219 Western Ave. at North Harvard St.: no rides during this period</div><div class=\"results_group\">Longwood Ave/Riverway: no rides during this period</div><div class=\"results_group\">Overland St at Brookline Ave: no rides during this period</div><div class=\"results_group\">Ball Sq: no rides during this period</div><div class=\"results_group\">South Bay Plaza: no rides during this period</div><div class=\"results_group\">Milk St at India St: no rides during this period</div><div class=\"results_group\">Warehouse - Back Door: no rides during this period</div><div class=\"results_group\">18 Dorrance Warehouse: 219 meters</div>"},"illustration_popular-routes0startYear2016startMonthstartWeekdaystartHourstationStart135136137138165169170membergender":{"direction":{"135":["149","133","138","141","107"],"136":["138","169","170","137","149"],"137":["170","169","138","142","168"],"138":["170","44","142","169","148"],"165":["170","138","169","142","168"],"169":["137","138","136","142","170"],"170":["137","138","165","136","142"]},"description":"<div class=\"results_title\">Most frequent stops from selected start stations</div><div class=\"results_group\"><strong>From:</strong> One Broadway / Kendall Sq at Main St / 3rd St<br><ol><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 846 trips</li><li>Lechmere Station at Cambridge St / First St, 464 trips</li><li>MIT at Mass Ave / Amherst St, 460 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 325 trips</li><li>Charles Circle - Charles St. at Cambridge St., 317 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Kendall T<br><ol><li>MIT at Mass Ave / Amherst St, 1527 trips</li><li>MIT Pacific St at Purrington St, 1345 trips</li><li>MIT Vassar St, 1293 trips</li><li>MIT Stata Center at Vassar St / Main St, 784 trips</li><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 760 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT Stata Center at Vassar St / Main St<br><ol><li>MIT Vassar St, 2128 trips</li><li>MIT Pacific St at Purrington St, 1731 trips</li><li>MIT at Mass Ave / Amherst St, 1404 trips</li><li>Central Square at Mass Ave / Essex St, 1269 trips</li><li>University Park, 675 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT at Mass Ave / Amherst St<br><ol><li>MIT Vassar St, 3113 trips</li><li>Beacon St / Mass Ave, 2702 trips</li><li>Central Square at Mass Ave / Essex St, 1880 trips</li><li>MIT Pacific St at Purrington St, 1605 trips</li><li>Harvard Square at Mass Ave/ Dunster, 1438 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Ames St at Main St<br><ol><li>MIT Vassar St, 1266 trips</li><li>MIT at Mass Ave / Amherst St, 881 trips</li><li>MIT Pacific St at Purrington St, 830 trips</li><li>Central Square at Mass Ave / Essex St, 641 trips</li><li>University Park, 443 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT Pacific St at Purrington St<br><ol><li>MIT Stata Center at Vassar St / Main St, 2470 trips</li><li>MIT at Mass Ave / Amherst St, 1888 trips</li><li>Kendall T, 1434 trips</li><li>Central Square at Mass Ave / Essex St, 1252 trips</li><li>MIT Vassar St, 1080 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT Vassar St<br><ol><li>MIT Stata Center at Vassar St / Main St, 3713 trips</li><li>MIT at Mass Ave / Amherst St, 2629 trips</li><li>Ames St at Main St, 1736 trips</li><li>Kendall T, 1678 trips</li><li>Central Square at Mass Ave / Essex St, 895 trips</li></ol></div>"},"illustration_popular-routes0startYear2016startMonthstartWeekdaystartHourstationStart181182183185member1gender":{"direction":{"181":["155","185","183","186","182"],"182":["181","158","186","179","182"],"183":["181","179","158","137","182"],"185":["181","158","185","134","155"]},"description":"<div class=\"results_title\">Most frequent stops from selected start stations</div><div class=\"results_group\"><strong>From:</strong> Davis Square<br><ol><li>Linear Park - Mass. Ave. at Cameron Ave. , 2344 trips</li><li>Teele Square at 239 Holland St, 1115 trips</li><li>Packard Ave / Powderhouse Blvd, 672 trips</li><li>Magoun Square at Trum Field, 384 trips</li><li>Powder House Circle - Nathan Tufts Park, 363 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Powder House Circle - Nathan Tufts Park<br><ol><li>Davis Square, 503 trips</li><li>Porter Square Station, 120 trips</li><li>Magoun Square at Trum Field, 84 trips</li><li>Conway Park - Somerville Avenue, 64 trips</li><li>Powder House Circle - Nathan Tufts Park, 61 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Packard Ave / Powderhouse Blvd<br><ol><li>Davis Square, 639 trips</li><li>Conway Park - Somerville Avenue, 120 trips</li><li>Porter Square Station, 67 trips</li><li>MIT Stata Center at Vassar St / Main St, 59 trips</li><li>Powder House Circle - Nathan Tufts Park, 45 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Teele Square at 239 Holland St<br><ol><li>Davis Square, 2102 trips</li><li>Porter Square Station, 115 trips</li><li>Teele Square at 239 Holland St, 66 trips</li><li>One Kendall Square at Hampshire St / Portland St, 63 trips</li><li>Linear Park - Mass. Ave. at Cameron Ave. , 61 trips</li></ol></div>"},"illustration_popular-routes0startYear2016startMonthstartWeekdaystartHourstationStart133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175membergender":{"direction":{"133":["139","137","163","136","134"],"134":["141","158","137","136","138"],"135":["149","133","138","141","107"],"136":["138","169","170","137","149"],"137":["170","169","138","142","168"],"138":["170","44","142","169","148"],"139":["142","133","137","138","165"],"140":["138","148","169","137","170"],"141":["143","137","142","151","136"],"142":["138","169","139","137","145"],"143":["148","138","141","137","140"],"144":["148","137","142","141","143"],"145":["148","146","142","151","147"],"146":["145","15","7","150","166"],"147":["154","145","150","15","138"],"148":["138","154","145","143","148"],"149":["135","136","137","18","161"],"150":["147","148","158","146","167"],"151":["154","141","148","178","145"],"152":["170","138","142","166","137"],"153":["148","147","154","145","158"],"154":["148","151","147","153","146"],"155":["181","162","155","158","148"],"156":["143","137","144","148","165"],"157":["137","18","133","158","138"],"158":["179","134","147","160","157"],"159":["142","138","137","152","143"],"160":["158","160","154","147","148"],"161":["149","133","137","18","91"],"162":["162","181","155","147","158"],"163":["133","163","112","114","94"],"164":["158","181","134","147","148"],"165":["170","138","169","142","168"],"166":["148","166","146","152","147"],"167":["147","181","148","153","151"],"168":["170","138","169","142","137"],"169":["137","138","136","142","170"],"170":["137","138","165","136","142"],"171":["147","158","146","148","171"],"172":["172","181","147","155","166"],"173":["142","136","168","137","165"],"174":["138","136","137","169","133"],"175":["136","157","103","135","137"]},"description":"<div class=\"results_title\">Most frequent stops from selected start stations</div><div class=\"results_group\"><strong>From:</strong> Lechmere Station at Cambridge St / First St<br><ol><li>Cambridge St - at Columbia St / Webster Ave, 714 trips</li><li>MIT Stata Center at Vassar St / Main St, 658 trips</li><li>EF - North Point Park, 418 trips</li><li>Kendall T, 360 trips</li><li>One Kendall Square at Hampshire St / Portland St, 332 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> One Kendall Square at Hampshire St / Portland St<br><ol><li>Inman Square at Vellucci Plaza / Hampshire St, 853 trips</li><li>Porter Square Station, 758 trips</li><li>MIT Stata Center at Vassar St / Main St, 678 trips</li><li>Kendall T, 653 trips</li><li>MIT at Mass Ave / Amherst St, 517 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> One Broadway / Kendall Sq at Main St / 3rd St<br><ol><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 846 trips</li><li>Lechmere Station at Cambridge St / First St, 464 trips</li><li>MIT at Mass Ave / Amherst St, 460 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 325 trips</li><li>Charles Circle - Charles St. at Cambridge St., 317 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Kendall T<br><ol><li>MIT at Mass Ave / Amherst St, 1527 trips</li><li>MIT Pacific St at Purrington St, 1345 trips</li><li>MIT Vassar St, 1293 trips</li><li>MIT Stata Center at Vassar St / Main St, 784 trips</li><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 760 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT Stata Center at Vassar St / Main St<br><ol><li>MIT Vassar St, 2128 trips</li><li>MIT Pacific St at Purrington St, 1731 trips</li><li>MIT at Mass Ave / Amherst St, 1404 trips</li><li>Central Square at Mass Ave / Essex St, 1269 trips</li><li>University Park, 675 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT at Mass Ave / Amherst St<br><ol><li>MIT Vassar St, 3113 trips</li><li>Beacon St / Mass Ave, 2702 trips</li><li>Central Square at Mass Ave / Essex St, 1880 trips</li><li>MIT Pacific St at Purrington St, 1605 trips</li><li>Harvard Square at Mass Ave/ Dunster, 1438 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Cambridge St - at Columbia St / Webster Ave<br><ol><li>Central Square at Mass Ave / Essex St, 911 trips</li><li>Lechmere Station at Cambridge St / First St, 584 trips</li><li>MIT Stata Center at Vassar St / Main St, 573 trips</li><li>MIT at Mass Ave / Amherst St, 536 trips</li><li>Ames St at Main St, 519 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lafayette Square at Mass Ave / Main St / Columbia St<br><ol><li>MIT at Mass Ave / Amherst St, 1089 trips</li><li>Harvard Square at Mass Ave/ Dunster, 659 trips</li><li>MIT Pacific St at Purrington St, 476 trips</li><li>MIT Stata Center at Vassar St / Main St, 468 trips</li><li>MIT Vassar St, 463 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Inman Square at Vellucci Plaza / Hampshire St<br><ol><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 1187 trips</li><li>MIT Stata Center at Vassar St / Main St, 1007 trips</li><li>Central Square at Mass Ave / Essex St, 637 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 581 trips</li><li>Kendall T, 516 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Central Square at Mass Ave / Essex St<br><ol><li>MIT at Mass Ave / Amherst St, 1448 trips</li><li>MIT Pacific St at Purrington St, 1339 trips</li><li>Cambridge St - at Columbia St / Webster Ave, 1137 trips</li><li>MIT Stata Center at Vassar St / Main St, 1113 trips</li><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 1111 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 896 trips</li><li>MIT at Mass Ave / Amherst St, 817 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 701 trips</li><li>MIT Stata Center at Vassar St / Main St, 698 trips</li><li>Lafayette Square at Mass Ave / Main St / Columbia St, 356 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Cambridge Main Library at Broadway / Trowbridge St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 797 trips</li><li>MIT Stata Center at Vassar St / Main St, 515 trips</li><li>Central Square at Mass Ave / Essex St, 460 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 428 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 357 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University Housing - 115 Putnam Ave at Peabody Terrace<br><ol><li>Harvard Square at Mass Ave/ Dunster, 1038 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 951 trips</li><li>Central Square at Mass Ave / Essex St, 790 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 640 trips</li><li>Harvard Square at Brattle St / Eliot St, 550 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Kennedy School at Bennett St / Eliot St<br><ol><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 693 trips</li><li>Harvard University Transportation Services - 175 North Harvard St, 619 trips</li><li>Harvard University Housing - 111 Western Ave. at Soldiers Field Park , 469 trips</li><li>Harvard Law School at Mass Ave / Jarvis St, 415 trips</li><li>Harvard University River Houses at DeWolfe St / Cowperthwaite St, 373 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Square at Brattle St / Eliot St<br><ol><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 670 trips</li><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 475 trips</li><li>Harvard Law School at Mass Ave / Jarvis St, 469 trips</li><li>Harvard University Transportation Services - 175 North Harvard St, 433 trips</li><li>MIT at Mass Ave / Amherst St, 406 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Square at Mass Ave/ Dunster<br><ol><li>MIT at Mass Ave / Amherst St, 1302 trips</li><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 1052 trips</li><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 1045 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 814 trips</li><li>Harvard Square at Mass Ave/ Dunster, 759 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> CambridgeSide Galleria - CambridgeSide PL at Land Blvd<br><ol><li>One Broadway / Kendall Sq at Main St / 3rd St, 630 trips</li><li>Kendall T, 587 trips</li><li>MIT Stata Center at Vassar St / Main St, 340 trips</li><li>Nashua Street at Red Auerbach Way, 290 trips</li><li>Kendall Street, 282 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Law School at Mass Ave / Jarvis St<br><ol><li>Harvard Square at Brattle St / Eliot St, 673 trips</li><li>Harvard Square at Mass Ave/ Dunster, 576 trips</li><li>Porter Square Station, 433 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 410 trips</li><li>Lesley University, 337 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University Gund Hall at Quincy St / Kirkland S<br><ol><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 713 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 493 trips</li><li>Harvard Square at Mass Ave/ Dunster, 493 trips</li><li>Beacon St at Washington / Kirkland, 476 trips</li><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 353 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lower Cambridgeport at Magazine St/Riverside Rd<br><ol><li>MIT Vassar St, 832 trips</li><li>MIT at Mass Ave / Amherst St, 682 trips</li><li>Central Square at Mass Ave / Essex St, 634 trips</li><li>Harvard University River Houses at DeWolfe St / Cowperthwaite St, 594 trips</li><li>MIT Stata Center at Vassar St / Main St, 559 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 490 trips</li><li>Harvard Square at Brattle St / Eliot St, 443 trips</li><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 414 trips</li><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 375 trips</li><li>Porter Square Station, 364 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University Radcliffe Quadrangle at Shepard St / Garden St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 959 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 736 trips</li><li>Harvard Square at Brattle St / Eliot St, 705 trips</li><li>Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St, 394 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 284 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Linear Park - Mass. Ave. at Cameron Ave. <br><ol><li>Davis Square, 2723 trips</li><li>Alewife Station at Russell Field, 498 trips</li><li>Linear Park - Mass. Ave. at Cameron Ave. , 302 trips</li><li>Porter Square Station, 225 trips</li><li>Harvard Square at Mass Ave/ Dunster, 166 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> 359 Broadway - Broadway at Fayette Street<br><ol><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 1010 trips</li><li>MIT Stata Center at Vassar St / Main St, 589 trips</li><li>Cambridge Main Library at Broadway / Trowbridge St, 471 trips</li><li>Harvard Square at Mass Ave/ Dunster, 416 trips</li><li>Ames St at Main St, 351 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Binney St / Sixth St<br><ol><li>MIT Stata Center at Vassar St / Main St, 472 trips</li><li>Nashua Street at Red Auerbach Way, 420 trips</li><li>Lechmere Station at Cambridge St / First St, 308 trips</li><li>Porter Square Station, 249 trips</li><li>MIT at Mass Ave / Amherst St, 234 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Porter Square Station<br><ol><li>Conway Park - Somerville Avenue, 751 trips</li><li>One Kendall Square at Hampshire St / Portland St, 723 trips</li><li>Harvard Square at Brattle St / Eliot St, 428 trips</li><li>Danehy Park, 427 trips</li><li>Binney St / Sixth St, 423 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Dana Park<br><ol><li>Central Square at Mass Ave / Essex St, 576 trips</li><li>MIT at Mass Ave / Amherst St, 384 trips</li><li>MIT Stata Center at Vassar St / Main St, 370 trips</li><li>Lower Cambridgeport at Magazine St/Riverside Rd, 346 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 322 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Danehy Park<br><ol><li>Porter Square Station, 443 trips</li><li>Danehy Park, 343 trips</li><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 253 trips</li><li>Harvard Square at Brattle St / Eliot St, 208 trips</li><li>Harvard Square at Mass Ave/ Dunster, 148 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Kendall Street<br><ol><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 469 trips</li><li>Lechmere Station at Cambridge St / First St, 294 trips</li><li>MIT Stata Center at Vassar St / Main St, 178 trips</li><li>Nashua Street at Red Auerbach Way, 164 trips</li><li>Cambridge St. at Joy St., 164 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Alewife Station at Russell Field<br><ol><li>Alewife Station at Russell Field, 555 trips</li><li>Davis Square, 428 trips</li><li>Linear Park - Mass. Ave. at Cameron Ave. , 287 trips</li><li>Harvard Square at Brattle St / Eliot St, 188 trips</li><li>Porter Square Station, 112 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> EF - North Point Park<br><ol><li>Lechmere Station at Cambridge St / First St, 461 trips</li><li>EF - North Point Park, 341 trips</li><li>Charlestown - Warren St at Chelsea St, 299 trips</li><li>Spaulding Rehabilitation Hospital - Charlestown Navy Yard, 247 trips</li><li>TD Garden - Causeway at Portal Park #2, 195 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Rindge Avenue - O'Neill Library<br><ol><li>Porter Square Station, 262 trips</li><li>Davis Square, 230 trips</li><li>One Kendall Square at Hampshire St / Portland St, 115 trips</li><li>Harvard Square at Brattle St / Eliot St, 114 trips</li><li>Harvard Square at Mass Ave/ Dunster, 86 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Ames St at Main St<br><ol><li>MIT Vassar St, 1266 trips</li><li>MIT at Mass Ave / Amherst St, 881 trips</li><li>MIT Pacific St at Purrington St, 830 trips</li><li>Central Square at Mass Ave / Essex St, 641 trips</li><li>University Park, 443 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University River Houses at DeWolfe St / Cowperthwaite St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 721 trips</li><li>Harvard University River Houses at DeWolfe St / Cowperthwaite St, 672 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 643 trips</li><li>Lower Cambridgeport at Magazine St/Riverside Rd, 474 trips</li><li>Harvard Square at Brattle St / Eliot St, 360 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lesley University<br><ol><li>Harvard Square at Brattle St / Eliot St, 218 trips</li><li>Davis Square, 200 trips</li><li>Harvard Square at Mass Ave/ Dunster, 140 trips</li><li>Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St, 136 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 128 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> University Park<br><ol><li>MIT Vassar St, 880 trips</li><li>MIT at Mass Ave / Amherst St, 718 trips</li><li>MIT Pacific St at Purrington St, 637 trips</li><li>Central Square at Mass Ave / Essex St, 611 trips</li><li>MIT Stata Center at Vassar St / Main St, 582 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT Pacific St at Purrington St<br><ol><li>MIT Stata Center at Vassar St / Main St, 2470 trips</li><li>MIT at Mass Ave / Amherst St, 1888 trips</li><li>Kendall T, 1434 trips</li><li>Central Square at Mass Ave / Essex St, 1252 trips</li><li>MIT Vassar St, 1080 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT Vassar St<br><ol><li>MIT Stata Center at Vassar St / Main St, 3713 trips</li><li>MIT at Mass Ave / Amherst St, 2629 trips</li><li>Ames St at Main St, 1736 trips</li><li>Kendall T, 1678 trips</li><li>Central Square at Mass Ave / Essex St, 895 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Mt Auburn<br><ol><li>Harvard Square at Brattle St / Eliot St, 288 trips</li><li>Porter Square Station, 270 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 158 trips</li><li>Harvard Square at Mass Ave/ Dunster, 154 trips</li><li>Mt Auburn, 112 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Alewife MBTA at Steel Place<br><ol><li>Alewife MBTA at Steel Place, 94 trips</li><li>Davis Square, 53 trips</li><li>Harvard Square at Brattle St / Eliot St, 24 trips</li><li>Linear Park - Mass. Ave. at Cameron Ave. , 16 trips</li><li>Harvard University River Houses at DeWolfe St / Cowperthwaite St, 16 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Sidney Research Campus/ Erie Street at Waverly<br><ol><li>Central Square at Mass Ave / Essex St, 97 trips</li><li>Kendall T, 80 trips</li><li>University Park, 51 trips</li><li>MIT Stata Center at Vassar St / Main St, 48 trips</li><li>Ames St at Main St, 43 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Third at Binney<br><ol><li>MIT at Mass Ave / Amherst St, 42 trips</li><li>Kendall T, 38 trips</li><li>MIT Stata Center at Vassar St / Main St, 33 trips</li><li>MIT Pacific St at Purrington St, 25 trips</li><li>Lechmere Station at Cambridge St / First St, 20 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Brian P. Murphy Staircase at Child Street<br><ol><li>Kendall T, 89 trips</li><li>Binney St / Sixth St, 61 trips</li><li>Post Office Square, 57 trips</li><li>One Broadway / Kendall Sq at Main St / 3rd St, 57 trips</li><li>MIT Stata Center at Vassar St / Main St, 45 trips</li></ol></div>"},"illustration_popular-routes0startYear2016startMonthstartWeekdaystartHourstationStart13642687778848890109membergender":{"direction":{"1":["10","113","37","33","101"],"36":["101","33","37","113","10"],"42":["10","113","99","103","37"],"68":["113","10","101","94","18"],"77":["10","88","33","78","77"],"78":["10","33","36","88","68"],"84":["10","84","101","85","73"],"88":["77","78","33","99","68"],"90":["18","101","33","10","90"],"109":["10","80","101","105","109"]},"description":"<div class=\"results_title\">Most frequent stops from selected start stations</div><div class=\"results_group\"><strong>From:</strong> Fan Pier<br><ol><li>South Station - 700 Atlantic Ave., 437 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 392 trips</li><li>Mayor Martin J Walsh - 28 State St, 311 trips</li><li>Aquarium Station - 200 Atlantic Ave., 272 trips</li><li>Cross St. at Hanover St., 264 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Seaport Square - Seaport Blvd. at Boston Wharf<br><ol><li>Cross St. at Hanover St., 610 trips</li><li>Aquarium Station - 200 Atlantic Ave., 527 trips</li><li>Mayor Martin J Walsh - 28 State St, 429 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 419 trips</li><li>South Station - 700 Atlantic Ave., 358 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Seaport Hotel<br><ol><li>South Station - 700 Atlantic Ave., 495 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 391 trips</li><li>Rowes Wharf - Atlantic Ave, 328 trips</li><li>Post Office Square, 214 trips</li><li>Mayor Martin J Walsh - 28 State St, 190 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Congress / Sleeper<br><ol><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 814 trips</li><li>South Station - 700 Atlantic Ave., 712 trips</li><li>Cross St. at Hanover St., 456 trips</li><li>TD Garden - Causeway at Portal Park #2, 416 trips</li><li>Nashua Street at Red Auerbach Way, 378 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> ID Building East<br><ol><li>South Station - 700 Atlantic Ave., 498 trips</li><li>Congress St and Northern Ave, 407 trips</li><li>Aquarium Station - 200 Atlantic Ave., 238 trips</li><li>ID Building West, 182 trips</li><li>ID Building East, 180 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> ID Building West<br><ol><li>South Station - 700 Atlantic Ave., 872 trips</li><li>Aquarium Station - 200 Atlantic Ave., 247 trips</li><li>Seaport Square - Seaport Blvd. at Boston Wharf, 237 trips</li><li>Congress St and Northern Ave, 235 trips</li><li>Congress / Sleeper, 209 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lawn on D<br><ol><li>South Station - 700 Atlantic Ave., 706 trips</li><li>Lawn on D, 320 trips</li><li>Cross St. at Hanover St., 287 trips</li><li>West Broadway at D Street, 258 trips</li><li>West Broadway at Dorchester St, 194 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Congress St and Northern Ave<br><ol><li>ID Building East, 326 trips</li><li>ID Building West, 296 trips</li><li>Aquarium Station - 200 Atlantic Ave., 233 trips</li><li>Rowes Wharf - Atlantic Ave, 196 trips</li><li>Congress / Sleeper, 183 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Watermark Seaport<br><ol><li>Nashua Street at Red Auerbach Way, 125 trips</li><li>Cross St. at Hanover St., 113 trips</li><li>Aquarium Station - 200 Atlantic Ave., 97 trips</li><li>South Station - 700 Atlantic Ave., 88 trips</li><li>Watermark Seaport, 49 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boston Convention & Exhibition Center<br><ol><li>South Station - 700 Atlantic Ave., 546 trips</li><li>Day Boulevard, 153 trips</li><li>Cross St. at Hanover St., 123 trips</li><li>Tremont St / West St, 102 trips</li><li>Boston Convention & Exhibition Center, 98 trips</li></ol></div>"},"illustration_stops3startYear2016startMonthstartWeekdaystartHourstationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199member0gender":{"trips":{"1":2.4,"2":2.7,"3":4.9,"4":7.6,"5":2.5,"6":1.6,"7":3.4,"8":3.2,"9":4.2,"10":15.7,"11":1.8,"12":4.4,"13":5.6,"14":2,"15":3.5,"16":1.3,"17":1.4,"18":5.5,"19":2.4,"20":0,"21":0.1,"22":0.1,"23":0.2,"24":0.1,"25":0.2,"26":0,"27":0.1,"28":0.2,"29":0,"30":7.2,"31":4.2,"32":2.2,"33":11,"34":8.4,"35":2.5,"36":5.6,"37":11.7,"38":11,"39":7.9,"40":3.4,"41":1.9,"42":3.9,"43":5,"44":13.1,"45":0.5,"46":9.8,"47":2.2,"48":3.3,"49":0.1,"50":0.1,"51":0,"52":0.2,"53":0.1,"54":0.1,"55":0,"56":0.1,"57":0,"58":6,"59":2.2,"60":1.6,"61":7.4,"62":0.2,"63":1.2,"64":2.9,"65":9.9,"66":9.7,"67":1.8,"68":5.5,"69":1.5,"70":1.3,"71":0.8,"72":0.2,"73":3,"74":3.2,"75":0.5,"76":0.1,"77":0.8,"78":1.7,"79":0.6,"80":4.4,"81":1.7,"82":3.1,"83":0.2,"84":5.4,"85":2.5,"86":0.4,"87":0.6,"88":4.2,"89":0.3,"90":0.6,"91":6.9,"92":1.1,"93":3,"94":6.2,"95":4.7,"96":14.4,"97":8.1,"98":16.7,"99":8.2,"100":9.8,"101":13.8,"102":7,"103":4.5,"104":5.1,"105":12.3,"106":4.7,"107":13.9,"108":18.3,"109":3.5,"110":9.4,"111":3.9,"112":10.5,"113":7.9,"114":2.7,"115":11,"116":1.4,"117":3.9,"118":1,"119":1,"120":0.1,"121":0.1,"122":1.9,"124":1.2,"125":0.6,"126":1.6,"127":1.6,"128":0.5,"129":2.6,"130":1.4,"131":1.6,"132":1.4,"133":7.2,"134":6.2,"135":5.4,"136":6.5,"137":7,"138":21.2,"139":5.6,"140":7.5,"141":5.5,"142":10.3,"143":7.4,"144":4.5,"145":3.6,"146":6.4,"147":9.3,"148":23.2,"149":7.7,"150":3.6,"151":5.1,"152":6.8,"153":2.3,"154":2.3,"155":2.6,"156":3.4,"157":2.5,"158":4.3,"159":1.8,"160":1.6,"161":3.8,"162":2.7,"163":4.1,"164":0.8,"165":5.8,"166":9.3,"167":1.6,"168":4.6,"169":1.9,"170":3.9,"171":1.9,"172":0.3,"173":0.1,"174":0.2,"175":0.4,"176":1.3,"177":3.7,"178":2.3,"179":2.1,"180":1.2,"181":5.6,"182":1.2,"183":0.9,"184":0.4,"185":0.6,"186":0.8,"187":1,"191":0,"199":0.1},"description":"<div class=\"results_title\">Number of trips ending at each station</div><div class=\"results_group\">Stations with the most trips:<br><ol><li>Harvard Square at Mass Ave/ Dunster, 23.2 stops/day</li><li>MIT at Mass Ave / Amherst St, 21.2 stops/day</li><li>The Esplanade - Beacon St. at Arlington St., 18.3 stops/day</li><li>Boylston St. at Arlington St., 16.7 stops/day</li><li>South Station - 700 Atlantic Ave., 15.7 stops/day</li></ol></div><div class=\"results_group\">Stations with the fewest trips:<br><ol><li>Chelsea St at Saratoga St, 0 stops/day</li><li>The Eddy at New Street, 0 stops/day</li><li>Central Square East Boston - Porter Street at London Street, 0 stops/day</li><li>Upham's Corner T Stop, 0 stops/day</li><li>Columbia Rd at Ceylon St, 0 stops/day</li></ol></div>","clusters":{"1":0,"2":0,"3":1,"4":1,"5":0,"6":0,"7":0,"8":0,"9":0,"10":2,"11":0,"12":0,"13":1,"14":0,"15":0,"16":0,"17":0,"18":1,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":1,"31":0,"32":0,"33":1,"34":1,"35":0,"36":1,"37":1,"38":1,"39":1,"40":0,"41":0,"42":0,"43":1,"44":2,"45":0,"46":1,"47":0,"48":0,"49":0,"50":0,"51":0,"52":0,"53":0,"54":0,"55":0,"56":0,"57":0,"58":1,"59":0,"60":0,"61":1,"62":0,"63":0,"64":0,"65":1,"66":1,"67":0,"68":1,"69":0,"70":0,"71":0,"72":0,"73":0,"74":0,"75":0,"76":0,"77":0,"78":0,"79":0,"80":0,"81":0,"82":0,"83":0,"84":1,"85":0,"86":0,"87":0,"88":0,"89":0,"90":0,"91":1,"92":0,"93":0,"94":1,"95":1,"96":2,"97":1,"98":2,"99":1,"100":1,"101":2,"102":1,"103":0,"104":1,"105":2,"106":1,"107":2,"108":2,"109":0,"110":1,"111":0,"112":1,"113":1,"114":0,"115":1,"116":0,"117":0,"118":0,"119":0,"120":0,"121":0,"122":0,"124":0,"125":0,"126":0,"127":0,"128":0,"129":0,"130":0,"131":0,"132":0,"133":1,"134":1,"135":1,"136":1,"137":1,"138":2,"139":1,"140":1,"141":1,"142":1,"143":1,"144":0,"145":0,"146":1,"147":1,"148":2,"149":1,"150":0,"151":1,"152":1,"153":0,"154":0,"155":0,"156":0,"157":0,"158":0,"159":0,"160":0,"161":0,"162":0,"163":0,"164":0,"165":1,"166":1,"167":0,"168":1,"169":0,"170":0,"171":0,"172":0,"173":0,"174":0,"175":0,"176":0,"177":0,"178":0,"179":0,"180":0,"181":1,"182":0,"183":0,"184":0,"185":0,"186":0,"187":0,"191":0,"199":0},"clusterMeans":[[1.6897637795275593],[7.329411764705884],[16.259999999999998]],"clusterMeansSorted":[1.6897637795275593,7.329411764705884,16.259999999999998],"clusterMeansOriginalArray":[1.6897637795275593,7.329411764705884,16.259999999999998]},"illustration_popular-routes0startYear2016startMonthstartWeekdaystartHourstationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199member0gender":{"direction":{"1":["1","33","101","99","10"],"2":["2","38","118","4","12"],"3":["4","3","38","8","12"],"4":["4","3","108","12","38"],"5":["131","5","43","31","39"],"6":["6","11","148","2","142"],"7":["7","148","147","142","146"],"8":["3","8","4","138","108"],"9":["10","61","65","9","34"],"10":["99","97","33","101","10"],"11":["148","6","11","15","38"],"12":["12","4","38","3","46"],"13":["10","13","113","101","97"],"14":["14","38","5","4","98"],"15":["15","148","146","147","2"],"16":["99","94","112","111","108"],"17":["114","100","112","16","111"],"18":["18","101","100","33","97"],"19":["19","105","98","100","97"],"20":["23","20","24","27","21"],"21":["21","27","20","22","28"],"22":["22","23","25","24","28"],"23":["23","22","24","25","28"],"24":["28","24","26","23","25"],"25":["25","28","23","21","22"],"26":["26","22","23"],"27":["27","25","187","20","24"],"28":["28","25","23","21","22"],"29":["29","21"],"30":["30","98","148","108","39"],"31":["59","31","127","126","39"],"32":["39","10","43","46","65"],"33":["33","101","10","112","97"],"34":["34","138","108","98","96"],"35":["35","46","34","65","40"],"36":["33","101","36","99","37"],"37":["37","98","115","101","110"],"38":["38","98","108","96","138"],"39":["39","96","66","98","65"],"40":["40","39","65","34","138"],"41":["41","39","96","43","65"],"42":["42","10","33","73","113"],"43":["43","46","96","65","66"],"44":["44","108","107","138","148"],"45":["110","10","45","68","70"],"46":["46","39","98","138","96"],"47":["47","98","108","115","96"],"48":["48","39","96","65","34"],"49":["5","49","53","9","39"],"50":["59","127","34","65","39"],"51":["51","45","72","75","79"],"52":["52","58","70","95","40"],"53":["53","127","49","40","96"],"54":["64","52","86"],"55":["42","55","30","96","104"],"56":["56","181","54","59","64"],"57":["57","88","41","55","64"],"58":["10","58","110","108","105"],"59":["31","34","126","61","59"],"60":["34","60","65","61","96"],"61":["61","10","9","37","105"],"62":["66","126","48","62","138"],"63":["10","65","31","34","105"],"64":["10","65","61","37","64"],"65":["65","98","39","96","105"],"66":["98","66","96","110","10"],"67":["10","68","73","74","109"],"68":["101","68","97","84","10"],"69":["77","69","80","10","84"],"70":["70","80","71","74","67"],"71":["71","80","70","74","69"],"72":["58","72","45","64","66"],"73":["73","80","10","42","36"],"74":["74","10","80","73","88"],"75":["75","79","46","84","44"],"76":["149","34","76","46","51"],"77":["69","10","33","36","77"],"78":["10","78","74","36","68"],"79":["58","9","64","65","89"],"80":["80","74","36","88","73"],"81":["10","81","68","84","74"],"82":["10","82","58","64","65"],"83":["83","126","48","122","9"],"84":["84","10","101","105","88"],"85":["80","10","85","84","99"],"86":["86","126","31","34","122"],"87":["87","68","10","70","89"],"88":["33","84","88","101","99"],"89":["89","71","80","87","70"],"90":["90","33","88","36","37"],"91":["91","107","101","136","108"],"92":["92","146","147","142","148"],"93":["10","110","96","61","93"],"94":["112","10","13","97","99"],"95":["101","95","33","98","10"],"96":["96","98","105","138","37"],"97":["10","112","97","99","33"],"98":["98","37","66","108","96"],"99":["101","97","113","99","94"],"100":["100","98","112","115","96"],"101":["112","101","10","105","99"],"102":["102","10","96","37","138"],"103":["113","103","101","98","33"],"104":["104","98","110","37","105"],"105":["105","98","108","37","101"],"106":["58","33","82","106","99"],"107":["107","44","138","115","98"],"108":["108","138","44","107","96"],"109":["10","105","109","102","95"],"110":["110","10","108","37","115"],"111":["112","101","94","111","13"],"112":["112","101","94","100","111"],"113":["112","10","13","99","113"],"114":["112","94","113","114","17"],"115":["115","44","138","108","96"],"116":["112","101","114","94","111"],"117":["117","37","98","107","110"],"118":["142","118","2","4","38"],"119":["119","146","38","15","108"],"120":["120","2","146","11","12"],"121":["121","6","38","14","130"],"122":["122","126","124","127","31"],"124":["122","43","124","35","34"],"125":["158","59","125","86","34"],"126":["122","126","127","61","31"],"127":["31","126","127","61","122"],"128":["122","128","32","39","41"],"129":["129","130","43","98","38"],"130":["130","129","38","43","40"],"131":["5","131","32","129","15"],"132":["132","34","43","46","122"],"133":["133","139","100","148","141"],"134":["138","141","158","148","134"],"135":["149","138","135","133","107"],"136":["148","138","136","107","149"],"137":["148","137","138","170","142"],"138":["148","138","108","142","44"],"139":["142","133","148","151","165"],"140":["148","138","44","147","140"],"141":["143","142","148","133","134"],"142":["148","139","141","138","152"],"143":["148","138","147","141","143"],"144":["148","144","138","147","143"],"145":["148","146","147","143","142"],"146":["138","146","150","108","166"],"147":["147","138","44","108","143"],"148":["138","148","140","143","44"],"149":["135","138","149","136","100"],"150":["148","147","146","150","138"],"151":["148","151","138","154","133"],"152":["148","152","142","166","138"],"153":["148","138","146","154","147"],"154":["148","147","151","153","154"],"155":["181","162","155","147","158"],"156":["143","148","147","137","134"],"157":["18","137","138","3","135"],"158":["171","134","179","147","160"],"159":["142","159","138","148","152"],"160":["160","158","162","147","148"],"161":["149","161","133","140","148"],"162":["162","155","181","147","133"],"163":["163","112","149","134","137"],"164":["134","181","158","147","148"],"165":["148","138","165","107","133"],"166":["166","148","138","44","146"],"167":["181","143","147","148","167"],"168":["148","168","138","147","157"],"169":["169","142","165","148","136"],"170":["137","138","170","165","148"],"171":["158","171","147","148","152"],"172":["172","181","148","162","182"],"173":["61","115","136","142","165"],"174":["18","38","174","177","138"],"175":["175","112","44","139","107"],"176":["181","177","176","148","179"],"177":["142","181","133","151","177"],"178":["148","178","143","147","151"],"179":["158","181","148","182","177"],"180":["158","181","148","147","179"],"181":["155","181","183","162","148"],"182":["181","182","148","186","158"],"183":["181","183","158","153","147"],"184":["181","139","133","9","184"],"185":["181","185","158","183","148"],"186":["181","186","133","162","158"],"187":["187","112","111","177","94"],"191":["149","93","48","3","66"],"199":["199"]},"description":"<div class=\"results_title\">Most frequent stops from selected start stations</div><div class=\"results_group\"><strong>From:</strong> Fan Pier<br><ol><li>Fan Pier, 80 trips</li><li>Aquarium Station - 200 Atlantic Ave., 73 trips</li><li>Cross St. at Hanover St., 59 trips</li><li>Rowes Wharf - Atlantic Ave, 45 trips</li><li>South Station - 700 Atlantic Ave., 41 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Union Square - Brighton Ave. at Cambridge St.<br><ol><li>Union Square - Brighton Ave. at Cambridge St., 60 trips</li><li>Kenmore Sq / Comm Ave, 52 trips</li><li>Brighton Center, 41 trips</li><li>B.U. Central - 725 Comm. Ave., 37 trips</li><li>Packard's Corner - Comm. Ave. at Brighton Ave., 33 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Agganis Arena - 925 Comm Ave.<br><ol><li>B.U. Central - 725 Comm. Ave., 179 trips</li><li>Agganis Arena - 925 Comm Ave., 123 trips</li><li>Kenmore Sq / Comm Ave, 85 trips</li><li>Buswell St. at Park Dr., 65 trips</li><li>Packard's Corner - Comm. Ave. at Brighton Ave., 53 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> B.U. Central - 725 Comm. Ave.<br><ol><li>B.U. Central - 725 Comm. Ave., 236 trips</li><li>Agganis Arena - 925 Comm Ave., 166 trips</li><li>The Esplanade - Beacon St. at Arlington St., 157 trips</li><li>Packard's Corner - Comm. Ave. at Brighton Ave., 149 trips</li><li>Kenmore Sq / Comm Ave, 102 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Longwood Ave / Binney St<br><ol><li>JFK Crossing at Harvard St. / Thorndike St., 68 trips</li><li>Longwood Ave / Binney St, 47 trips</li><li>Landmark Centre, 41 trips</li><li>Ruggles Station / Columbus Ave., 30 trips</li><li>Yawkey Way at Boylston St., 30 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Real Estate - Brighton Mills - 370 Western Ave<br><ol><li>Harvard Real Estate - Brighton Mills - 370 Western Ave, 49 trips</li><li>Innovation Lab - 125 Western Ave. at Batten Way, 34 trips</li><li>Harvard Square at Mass Ave/ Dunster, 31 trips</li><li>Union Square - Brighton Ave. at Cambridge St., 15 trips</li><li>Central Square at Mass Ave / Essex St, 15 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University Housing - 111 Western Ave. at Soldiers Field Park <br><ol><li>Harvard University Housing - 111 Western Ave. at Soldiers Field Park , 114 trips</li><li>Harvard Square at Mass Ave/ Dunster, 113 trips</li><li>Harvard Square at Brattle St / Eliot St, 74 trips</li><li>Central Square at Mass Ave / Essex St, 73 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 54 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Buswell St. at Park Dr.<br><ol><li>Agganis Arena - 925 Comm Ave., 68 trips</li><li>Buswell St. at Park Dr., 66 trips</li><li>B.U. Central - 725 Comm. Ave., 33 trips</li><li>MIT at Mass Ave / Amherst St, 33 trips</li><li>The Esplanade - Beacon St. at Arlington St., 32 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Tremont St / W Newton St<br><ol><li>South Station - 700 Atlantic Ave., 108 trips</li><li>Back Bay / South End Station, 93 trips</li><li>Prudential Center / Belvidere, 56 trips</li><li>Tremont St / W Newton St, 53 trips</li><li>Christian Science Plaza, 49 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> South Station - 700 Atlantic Ave.<br><ol><li>Rowes Wharf - Atlantic Ave, 285 trips</li><li>Lewis Wharf - Atlantic Ave., 275 trips</li><li>Aquarium Station - 200 Atlantic Ave., 222 trips</li><li>Cross St. at Hanover St., 209 trips</li><li>South Station - 700 Atlantic Ave., 194 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Innovation Lab - 125 Western Ave. at Batten Way<br><ol><li>Harvard Square at Mass Ave/ Dunster, 49 trips</li><li>Harvard Real Estate - Brighton Mills - 370 Western Ave, 44 trips</li><li>Innovation Lab - 125 Western Ave. at Batten Way, 34 trips</li><li>Harvard University Transportation Services - 175 North Harvard St, 29 trips</li><li>Kenmore Sq / Comm Ave, 26 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Packard's Corner - Comm. Ave. at Brighton Ave.<br><ol><li>Packard's Corner - Comm. Ave. at Brighton Ave., 114 trips</li><li>B.U. Central - 725 Comm. Ave., 91 trips</li><li>Kenmore Sq / Comm Ave, 76 trips</li><li>Agganis Arena - 925 Comm Ave., 46 trips</li><li>Boylston / Mass Ave, 46 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> John F Fitzgerald - Surface Road at India Street<br><ol><li>South Station - 700 Atlantic Ave., 129 trips</li><li>John F Fitzgerald - Surface Road at India Street, 129 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 91 trips</li><li>Cross St. at Hanover St., 68 trips</li><li>Lewis Wharf - Atlantic Ave., 63 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Allston Green District - Commonwealth Ave & Griggs St<br><ol><li>Allston Green District - Commonwealth Ave & Griggs St, 81 trips</li><li>Kenmore Sq / Comm Ave, 38 trips</li><li>Longwood Ave / Binney St, 34 trips</li><li>B.U. Central - 725 Comm. Ave., 30 trips</li><li>Boylston St. at Arlington St., 25 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University Transportation Services - 175 North Harvard St<br><ol><li>Harvard University Transportation Services - 175 North Harvard St, 148 trips</li><li>Harvard Square at Mass Ave/ Dunster, 119 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 91 trips</li><li>Harvard Square at Brattle St / Eliot St, 60 trips</li><li>Union Square - Brighton Ave. at Cambridge St., 49 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Edwards Playground - Main Street & Eden Street<br><ol><li>Rowes Wharf - Atlantic Ave, 29 trips</li><li>TD Garden - Causeway at Portal Park #2, 20 trips</li><li>Charlestown - Warren St at Chelsea St, 20 trips</li><li>Charlestown - Main St at Austin St, 18 trips</li><li>The Esplanade - Beacon St. at Arlington St., 16 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Bunker Hill Community College<br><ol><li>Spaulding Rehabilitation Hospital - Charlestown Navy Yard, 38 trips</li><li>Faneuil Hall - Union St. at North St., 30 trips</li><li>Charlestown - Warren St at Chelsea St, 30 trips</li><li>Edwards Playground - Main Street & Eden Street, 26 trips</li><li>Charlestown - Main St at Austin St, 26 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Nashua Street at Red Auerbach Way<br><ol><li>Nashua Street at Red Auerbach Way, 80 trips</li><li>Cross St. at Hanover St., 69 trips</li><li>Faneuil Hall - Union St. at North St., 59 trips</li><li>Aquarium Station - 200 Atlantic Ave., 58 trips</li><li>Lewis Wharf - Atlantic Ave., 58 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Purchase St at Pearl St<br><ol><li>Purchase St at Pearl St, 45 trips</li><li>Tremont St / West St, 35 trips</li><li>Boylston St. at Arlington St., 33 trips</li><li>Faneuil Hall - Union St. at North St., 31 trips</li><li>Lewis Wharf - Atlantic Ave., 30 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Chelsea St at Saratoga St<br><ol><li>Maverick Sq - Lewis Mall, 6 trips</li><li>Chelsea St at Saratoga St, 4 trips</li><li>EBNHC - 20 Maverick Sq, 2 trips</li><li>Glendon St at Condor St, 2 trips</li><li>Bennington St at Byron St, 1 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Bennington St at Byron St<br><ol><li>Bennington St at Byron St, 14 trips</li><li>Glendon St at Condor St, 3 trips</li><li>Chelsea St at Saratoga St, 2 trips</li><li>Piers Park- Marginal St at East Boston Shipyard, 2 trips</li><li>Orient Heights T Stop - Bennington St at Saratoga St, 2 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Piers Park- Marginal St at East Boston Shipyard<br><ol><li>Piers Park- Marginal St at East Boston Shipyard, 14 trips</li><li>Maverick Sq - Lewis Mall, 14 trips</li><li>Airport T Stop - Bremen St at Brooks St, 7 trips</li><li>EBNHC - 20 Maverick Sq, 3 trips</li><li>Orient Heights T Stop - Bennington St at Saratoga St, 3 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Maverick Sq - Lewis Mall<br><ol><li>Maverick Sq - Lewis Mall, 28 trips</li><li>Piers Park- Marginal St at East Boston Shipyard, 8 trips</li><li>EBNHC - 20 Maverick Sq, 7 trips</li><li>Airport T Stop - Bremen St at Brooks St, 7 trips</li><li>Orient Heights T Stop - Bennington St at Saratoga St, 5 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> EBNHC - 20 Maverick Sq<br><ol><li>Orient Heights T Stop - Bennington St at Saratoga St, 10 trips</li><li>EBNHC - 20 Maverick Sq, 8 trips</li><li>The Eddy at New Street, 4 trips</li><li>Maverick Sq - Lewis Mall, 2 trips</li><li>Airport T Stop - Bremen St at Brooks St, 2 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Airport T Stop - Bremen St at Brooks St<br><ol><li>Airport T Stop - Bremen St at Brooks St, 29 trips</li><li>Orient Heights T Stop - Bennington St at Saratoga St, 13 trips</li><li>Maverick Sq - Lewis Mall, 10 trips</li><li>Bennington St at Byron St, 6 trips</li><li>Piers Park- Marginal St at East Boston Shipyard, 6 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> The Eddy at New Street<br><ol><li>The Eddy at New Street, 4 trips</li><li>Piers Park- Marginal St at East Boston Shipyard, 3 trips</li><li>Maverick Sq - Lewis Mall, 1 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Glendon St at Condor St<br><ol><li>Glendon St at Condor St, 17 trips</li><li>Airport T Stop - Bremen St at Brooks St, 3 trips</li><li>Broadway St at Mt Pleasant St, 3 trips</li><li>Chelsea St at Saratoga St, 2 trips</li><li>EBNHC - 20 Maverick Sq, 1 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Orient Heights T Stop - Bennington St at Saratoga St<br><ol><li>Orient Heights T Stop - Bennington St at Saratoga St, 26 trips</li><li>Airport T Stop - Bremen St at Brooks St, 9 trips</li><li>Maverick Sq - Lewis Mall, 4 trips</li><li>Bennington St at Byron St, 3 trips</li><li>Piers Park- Marginal St at East Boston Shipyard, 3 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Central Square East Boston - Porter Street at London Street<br><ol><li>Central Square East Boston - Porter Street at London Street, 2 trips</li><li>Bennington St at Byron St, 1 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Newbury St / Hereford St<br><ol><li>Newbury St / Hereford St, 188 trips</li><li>Boylston St. at Arlington St., 114 trips</li><li>Harvard Square at Mass Ave/ Dunster, 103 trips</li><li>The Esplanade - Beacon St. at Arlington St., 95 trips</li><li>Yawkey Way at Boylston St., 93 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Ruggles Station / Columbus Ave.<br><ol><li>Roxbury Crossing Station, 116 trips</li><li>Ruggles Station / Columbus Ave., 114 trips</li><li>Jackson Square T at Centre St, 69 trips</li><li>Green St T, 68 trips</li><li>Yawkey Way at Boylston St., 44 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> HMS / HSPH - Ave. Louis Pasteur at Longwood Ave.<br><ol><li>Yawkey Way at Boylston St., 40 trips</li><li>South Station - 700 Atlantic Ave., 37 trips</li><li>Landmark Centre, 37 trips</li><li>Boylston / Mass Ave, 27 trips</li><li>Prudential Center / Belvidere, 27 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Aquarium Station - 200 Atlantic Ave.<br><ol><li>Aquarium Station - 200 Atlantic Ave., 326 trips</li><li>Cross St. at Hanover St., 214 trips</li><li>South Station - 700 Atlantic Ave., 195 trips</li><li>Charlestown - Warren St at Chelsea St, 147 trips</li><li>Lewis Wharf - Atlantic Ave., 139 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Christian Science Plaza<br><ol><li>Christian Science Plaza, 260 trips</li><li>MIT at Mass Ave / Amherst St, 127 trips</li><li>The Esplanade - Beacon St. at Arlington St., 104 trips</li><li>Boylston St. at Arlington St., 94 trips</li><li>Boston Public Library - 700 Boylston St., 87 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Colleges of the Fenway<br><ol><li>Colleges of the Fenway, 61 trips</li><li>Boylston / Mass Ave, 59 trips</li><li>Christian Science Plaza, 38 trips</li><li>Prudential Center / Belvidere, 29 trips</li><li>Northeastern U / North Parking Lot, 27 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Seaport Square - Seaport Blvd. at Boston Wharf<br><ol><li>Aquarium Station - 200 Atlantic Ave., 160 trips</li><li>Cross St. at Hanover St., 132 trips</li><li>Seaport Square - Seaport Blvd. at Boston Wharf, 122 trips</li><li>Rowes Wharf - Atlantic Ave, 105 trips</li><li>Mayor Martin J Walsh - 28 State St, 90 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Mayor Martin J Walsh - 28 State St<br><ol><li>Mayor Martin J Walsh - 28 State St, 289 trips</li><li>Boylston St. at Arlington St., 165 trips</li><li>Charles St at Beacon St, 135 trips</li><li>Cross St. at Hanover St., 125 trips</li><li>Boylston St / Washington St, 115 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Kenmore Sq / Comm Ave<br><ol><li>Kenmore Sq / Comm Ave, 301 trips</li><li>Boylston St. at Arlington St., 207 trips</li><li>The Esplanade - Beacon St. at Arlington St., 173 trips</li><li>Boston Public Library - 700 Boylston St., 133 trips</li><li>MIT at Mass Ave / Amherst St, 123 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Yawkey Way at Boylston St.<br><ol><li>Yawkey Way at Boylston St., 172 trips</li><li>Boston Public Library - 700 Boylston St., 139 trips</li><li>Boylston at Fairfield, 124 trips</li><li>Boylston St. at Arlington St., 120 trips</li><li>Prudential Center / Belvidere, 113 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Northeastern U / North Parking Lot<br><ol><li>Northeastern U / North Parking Lot, 114 trips</li><li>Yawkey Way at Boylston St., 56 trips</li><li>Prudential Center / Belvidere, 44 trips</li><li>Christian Science Plaza, 42 trips</li><li>MIT at Mass Ave / Amherst St, 41 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Brigham Cir / Huntington Ave<br><ol><li>Brigham Cir / Huntington Ave, 41 trips</li><li>Yawkey Way at Boylston St., 28 trips</li><li>Boston Public Library - 700 Boylston St., 28 trips</li><li>Landmark Centre, 23 trips</li><li>Prudential Center / Belvidere, 20 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Seaport Hotel<br><ol><li>Seaport Hotel, 89 trips</li><li>South Station - 700 Atlantic Ave., 82 trips</li><li>Aquarium Station - 200 Atlantic Ave., 61 trips</li><li>West Broadway at Dorchester St, 50 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 48 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Landmark Centre<br><ol><li>Landmark Centre, 98 trips</li><li>Boylston / Mass Ave, 62 trips</li><li>Boston Public Library - 700 Boylston St., 38 trips</li><li>Prudential Center / Belvidere, 37 trips</li><li>Boylston at Fairfield, 35 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Beacon St / Mass Ave<br><ol><li>Beacon St / Mass Ave, 334 trips</li><li>The Esplanade - Beacon St. at Arlington St., 255 trips</li><li>Charles Circle - Charles St. at Cambridge St., 196 trips</li><li>MIT at Mass Ave / Amherst St, 189 trips</li><li>Harvard Square at Mass Ave/ Dunster, 156 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Dudley Square<br><ol><li>Boylston St / Washington St, 11 trips</li><li>South Station - 700 Atlantic Ave., 9 trips</li><li>Dudley Square, 8 trips</li><li>Congress / Sleeper, 8 trips</li><li>JFK / UMASS at MBTA Station, 6 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boylston / Mass Ave<br><ol><li>Boylston / Mass Ave, 147 trips</li><li>Yawkey Way at Boylston St., 137 trips</li><li>Boylston St. at Arlington St., 121 trips</li><li>MIT at Mass Ave / Amherst St, 109 trips</li><li>Boston Public Library - 700 Boylston St., 91 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> BIDMC - Brookline at Burlington St<br><ol><li>BIDMC - Brookline at Burlington St, 44 trips</li><li>Boylston St. at Arlington St., 30 trips</li><li>The Esplanade - Beacon St. at Arlington St., 27 trips</li><li>Charles St at Beacon St, 24 trips</li><li>Boston Public Library - 700 Boylston St., 22 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Wentworth Institute of Technology<br><ol><li>Wentworth Institute of Technology, 88 trips</li><li>Yawkey Way at Boylston St., 54 trips</li><li>Boston Public Library - 700 Boylston St., 54 trips</li><li>Prudential Center / Belvidere, 49 trips</li><li>Christian Science Plaza, 43 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Roxbury YMCA<br><ol><li>Longwood Ave / Binney St, 3 trips</li><li>Roxbury YMCA, 3 trips</li><li>Walnut Ave at Crawford St, 3 trips</li><li>Tremont St / W Newton St, 2 trips</li><li>Yawkey Way at Boylston St., 2 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MLK Blvd at Washington St<br><ol><li>Roxbury Crossing Station, 6 trips</li><li>Jackson Square T at Centre St, 5 trips</li><li>Christian Science Plaza, 4 trips</li><li>Prudential Center / Belvidere, 4 trips</li><li>Yawkey Way at Boylston St., 3 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Upham's Corner T Stop<br><ol><li>Upham's Corner T Stop, 3 trips</li><li>Dudley Square, 2 trips</li><li>Mt Pleasant Ave / Dudley Town Common, 2 trips</li><li>E. Cottage St at Columbia Rd, 2 trips</li><li>Mass Ave at Newmarket Square, 2 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Washington St at Melnea Cass Blvd<br><ol><li>Washington St at Melnea Cass Blvd, 4 trips</li><li>Tremont St. at Berkeley St., 4 trips</li><li>JFK / UMASS at MBTA Station, 4 trips</li><li>Franklin St. / Arch St., 4 trips</li><li>Northeastern U / North Parking Lot, 3 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Walnut Ave at Crawford St<br><ol><li>Walnut Ave at Crawford St, 5 trips</li><li>Jackson Square T at Centre St, 4 trips</li><li>Roxbury YMCA, 3 trips</li><li>Northeastern U / North Parking Lot, 2 trips</li><li>Boston Public Library - 700 Boylston St., 2 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Grove Hall Library<br><ol><li>Washington St. at Rutland St., 4 trips</li><li>Washington St at Melnea Cass Blvd, 2 trips</li><li>Franklin Park Zoo, 1 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Columbia Rd at Ceylon St<br><ol><li>Seaport Hotel, 2 trips</li><li>Columbia Rd at Ceylon St, 2 trips</li><li>Newbury St / Hereford St, 1 trips</li><li>Boston Public Library - 700 Boylston St., 1 trips</li><li>Boylston St / Berkeley St, 1 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Walnut Ave at Warren St<br><ol><li>Walnut Ave at Warren St, 4 trips</li><li>Davis Square, 3 trips</li><li>Grove Hall Library, 2 trips</li><li>Roxbury Crossing Station, 2 trips</li><li>Washington St. at Rutland St., 2 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Bowdoin St at Quincy St<br><ol><li>Bowdoin St at Quincy St, 3 trips</li><li>Congress St and Northern Ave, 3 trips</li><li>Brigham Cir / Huntington Ave, 2 trips</li><li>Columbia Rd at Ceylon St, 1 trips</li><li>Washington St. at Rutland St., 1 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Tremont St. at Berkeley St.<br><ol><li>South Station - 700 Atlantic Ave., 118 trips</li><li>Tremont St. at Berkeley St., 91 trips</li><li>Boylston St / Washington St, 84 trips</li><li>The Esplanade - Beacon St. at Arlington St., 82 trips</li><li>Tremont St / West St, 77 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Roxbury Crossing Station<br><ol><li>Ruggles Station / Columbus Ave., 141 trips</li><li>Christian Science Plaza, 48 trips</li><li>Green St T, 35 trips</li><li>Back Bay / South End Station, 29 trips</li><li>Roxbury Crossing Station, 28 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boston Medical Center - East Concord at Harrison Ave<br><ol><li>Christian Science Plaza, 33 trips</li><li>Boston Medical Center - East Concord at Harrison Ave, 25 trips</li><li>Prudential Center / Belvidere, 25 trips</li><li>Back Bay / South End Station, 21 trips</li><li>Boston Public Library - 700 Boylston St., 20 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Back Bay / South End Station<br><ol><li>Back Bay / South End Station, 105 trips</li><li>South Station - 700 Atlantic Ave., 103 trips</li><li>Tremont St / W Newton St, 75 trips</li><li>Mayor Martin J Walsh - 28 State St, 66 trips</li><li>Tremont St / West St, 64 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Columbus Ave. at Mass. Ave.<br><ol><li>Boylston at Fairfield, 7 trips</li><li>Green St T, 7 trips</li><li>Wentworth Institute of Technology, 5 trips</li><li>Columbus Ave. at Mass. Ave., 5 trips</li><li>MIT at Mass Ave / Amherst St, 5 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Washington St. at Lenox St.<br><ol><li>South Station - 700 Atlantic Ave., 35 trips</li><li>Prudential Center / Belvidere, 25 trips</li><li>Ruggles Station / Columbus Ave., 20 trips</li><li>Christian Science Plaza, 15 trips</li><li>Tremont St / West St, 10 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Washington St. at Rutland St.<br><ol><li>South Station - 700 Atlantic Ave., 46 trips</li><li>Prudential Center / Belvidere, 46 trips</li><li>Back Bay / South End Station, 44 trips</li><li>Mayor Martin J Walsh - 28 State St, 35 trips</li><li>Washington St. at Rutland St., 35 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Prudential Center / Belvidere<br><ol><li>Prudential Center / Belvidere, 214 trips</li><li>Boylston St. at Arlington St., 136 trips</li><li>Yawkey Way at Boylston St., 101 trips</li><li>Boston Public Library - 700 Boylston St., 87 trips</li><li>Tremont St / West St, 86 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boylston at Fairfield<br><ol><li>Boylston St. at Arlington St., 190 trips</li><li>Boylston at Fairfield, 165 trips</li><li>Boston Public Library - 700 Boylston St., 128 trips</li><li>Boylston St / Washington St, 106 trips</li><li>South Station - 700 Atlantic Ave., 101 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Dorchester Ave. at Gillette Park<br><ol><li>South Station - 700 Atlantic Ave., 43 trips</li><li>Congress / Sleeper, 35 trips</li><li>West Broadway at Dorchester St, 32 trips</li><li>South Boston Library - 646 East Broadway, 29 trips</li><li>Boston Convention & Exhibition Center, 29 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Congress / Sleeper<br><ol><li>Cross St. at Hanover St., 83 trips</li><li>Congress / Sleeper, 81 trips</li><li>Lewis Wharf - Atlantic Ave., 77 trips</li><li>Lawn on D, 73 trips</li><li>South Station - 700 Atlantic Ave., 66 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Andrew Station - Dorchester Ave at Humboldt Pl<br><ol><li>ID Building East, 45 trips</li><li>Andrew Station - Dorchester Ave at Humboldt Pl, 33 trips</li><li>Day Boulevard, 31 trips</li><li>South Station - 700 Atlantic Ave., 23 trips</li><li>Lawn on D, 23 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> JFK / UMASS at MBTA Station<br><ol><li>JFK / UMASS at MBTA Station, 80 trips</li><li>Day Boulevard, 74 trips</li><li>UMass Boston Integrated Sciences Complex, 64 trips</li><li>South Boston Library - 646 East Broadway, 16 trips</li><li>Dorchester Ave. at Gillette Park, 15 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> UMass Boston Integrated Sciences Complex<br><ol><li>UMass Boston Integrated Sciences Complex, 54 trips</li><li>Day Boulevard, 54 trips</li><li>JFK / UMASS at MBTA Station, 53 trips</li><li>South Boston Library - 646 East Broadway, 14 trips</li><li>Andrew Station - Dorchester Ave at Humboldt Pl, 11 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Mt Pleasant Ave / Dudley Town Common<br><ol><li>Tremont St. at Berkeley St., 5 trips</li><li>Mt Pleasant Ave / Dudley Town Common, 5 trips</li><li>Dudley Square, 4 trips</li><li>Washington St. at Rutland St., 4 trips</li><li>Boylston at Fairfield, 4 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> West Broadway at Dorchester St<br><ol><li>West Broadway at Dorchester St, 100 trips</li><li>Day Boulevard, 60 trips</li><li>South Station - 700 Atlantic Ave., 56 trips</li><li>Seaport Hotel, 50 trips</li><li>Seaport Square - Seaport Blvd. at Boston Wharf, 49 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> South Boston Library - 646 East Broadway<br><ol><li>South Boston Library - 646 East Broadway, 128 trips</li><li>South Station - 700 Atlantic Ave., 79 trips</li><li>Day Boulevard, 64 trips</li><li>West Broadway at Dorchester St, 56 trips</li><li>Congress St and Northern Ave, 38 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> E. Cottage St at Columbia Rd<br><ol><li>E. Cottage St at Columbia Rd, 14 trips</li><li>Mass Ave at Newmarket Square, 10 trips</li><li>Boylston / Mass Ave, 9 trips</li><li>Lawn on D, 9 trips</li><li>Beacon St / Mass Ave, 8 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Upham's Corner - Columbia Rd<br><ol><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 61 trips</li><li>Christian Science Plaza, 4 trips</li><li>Upham's Corner - Columbia Rd, 4 trips</li><li>Boylston / Mass Ave, 2 trips</li><li>Upham's Corner T Stop, 2 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> ID Building East<br><ol><li>Andrew Station - Dorchester Ave at Humboldt Pl, 42 trips</li><li>South Station - 700 Atlantic Ave., 36 trips</li><li>Aquarium Station - 200 Atlantic Ave., 13 trips</li><li>Seaport Square - Seaport Blvd. at Boston Wharf, 11 trips</li><li>ID Building East, 11 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> ID Building West<br><ol><li>South Station - 700 Atlantic Ave., 60 trips</li><li>ID Building West, 39 trips</li><li>South Boston Library - 646 East Broadway, 38 trips</li><li>Seaport Square - Seaport Blvd. at Boston Wharf, 31 trips</li><li>Congress / Sleeper, 26 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Mass Ave at Newmarket Square<br><ol><li>Tremont St. at Berkeley St., 8 trips</li><li>Tremont St / W Newton St, 7 trips</li><li>Washington St. at Rutland St., 6 trips</li><li>Prudential Center / Belvidere, 6 trips</li><li>Savin Hill MBTA Station, 6 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Day Boulevard<br><ol><li>Day Boulevard, 541 trips</li><li>South Boston Library - 646 East Broadway, 86 trips</li><li>Seaport Square - Seaport Blvd. at Boston Wharf, 73 trips</li><li>Congress St and Northern Ave, 56 trips</li><li>West Broadway at Dorchester St, 51 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> State Street at Channel Center<br><ol><li>South Station - 700 Atlantic Ave., 36 trips</li><li>State Street at Channel Center, 33 trips</li><li>Congress / Sleeper, 29 trips</li><li>Lawn on D, 29 trips</li><li>South Boston Library - 646 East Broadway, 25 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Ink Block<br><ol><li>South Station - 700 Atlantic Ave., 104 trips</li><li>Ink Block, 61 trips</li><li>Tremont St. at Berkeley St., 44 trips</li><li>Washington St. at Rutland St., 39 trips</li><li>Prudential Center / Belvidere, 37 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Franklin Park - Seaver Street at Humbolt Ave<br><ol><li>Franklin Park - Seaver Street at Humbolt Ave, 40 trips</li><li>Green St T, 6 trips</li><li>Wentworth Institute of Technology, 5 trips</li><li>Curtis Hall at South Street, 5 trips</li><li>Tremont St / W Newton St, 4 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lawn on D<br><ol><li>Lawn on D, 193 trips</li><li>South Station - 700 Atlantic Ave., 155 trips</li><li>Cross St. at Hanover St., 114 trips</li><li>Tremont St / West St, 98 trips</li><li>Congress St and Northern Ave, 85 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> West Broadway at D Street<br><ol><li>Day Boulevard, 59 trips</li><li>South Station - 700 Atlantic Ave., 51 trips</li><li>West Broadway at D Street, 47 trips</li><li>Lawn on D, 46 trips</li><li>Rowes Wharf - Atlantic Ave, 33 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Franklin Park Zoo<br><ol><li>Franklin Park Zoo, 57 trips</li><li>Green St T, 9 trips</li><li>Ruggles Station / Columbus Ave., 7 trips</li><li>Christian Science Plaza, 7 trips</li><li>Curtis Hall at South Street, 6 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Ryan Playground - Dorchester Avenue Station<br><ol><li>Ryan Playground - Dorchester Avenue Station, 28 trips</li><li>Congress / Sleeper, 19 trips</li><li>South Station - 700 Atlantic Ave., 16 trips</li><li>JFK / UMASS at MBTA Station, 9 trips</li><li>Savin Hill MBTA Station, 9 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Congress St and Northern Ave<br><ol><li>Aquarium Station - 200 Atlantic Ave., 93 trips</li><li>Lawn on D, 84 trips</li><li>Congress St and Northern Ave, 76 trips</li><li>Cross St. at Hanover St., 65 trips</li><li>Rowes Wharf - Atlantic Ave, 63 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Savin Hill MBTA Station<br><ol><li>Savin Hill MBTA Station, 30 trips</li><li>UMass Boston Integrated Sciences Complex, 11 trips</li><li>Day Boulevard, 5 trips</li><li>Ryan Playground - Dorchester Avenue Station, 5 trips</li><li>JFK / UMASS at MBTA Station, 4 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Watermark Seaport<br><ol><li>Watermark Seaport, 17 trips</li><li>Aquarium Station - 200 Atlantic Ave., 10 trips</li><li>Congress St and Northern Ave, 9 trips</li><li>Seaport Square - Seaport Blvd. at Boston Wharf, 8 trips</li><li>Mayor Martin J Walsh - 28 State St, 6 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Cambridge St. at Joy St.<br><ol><li>Cambridge St. at Joy St., 133 trips</li><li>Charles Circle - Charles St. at Cambridge St., 114 trips</li><li>Cross St. at Hanover St., 78 trips</li><li>Kendall T, 67 trips</li><li>The Esplanade - Beacon St. at Arlington St., 66 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> New Balance - 20 Guest St.<br><ol><li>New Balance - 20 Guest St., 51 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 19 trips</li><li>Harvard Square at Brattle St / Eliot St, 15 trips</li><li>Central Square at Mass Ave / Essex St, 14 trips</li><li>Harvard Square at Mass Ave/ Dunster, 13 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Washington St. at Waltham St.<br><ol><li>South Station - 700 Atlantic Ave., 57 trips</li><li>Boylston St / Washington St, 47 trips</li><li>Boston Public Library - 700 Boylston St., 45 trips</li><li>Back Bay / South End Station, 43 trips</li><li>Washington St. at Waltham St., 38 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> TD Garden - Causeway at Portal Park #2<br><ol><li>Charlestown - Warren St at Chelsea St, 164 trips</li><li>South Station - 700 Atlantic Ave., 120 trips</li><li>John F Fitzgerald - Surface Road at India Street, 82 trips</li><li>Lewis Wharf - Atlantic Ave., 78 trips</li><li>Rowes Wharf - Atlantic Ave, 69 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Franklin St. / Arch St.<br><ol><li>Cross St. at Hanover St., 77 trips</li><li>Franklin St. / Arch St., 70 trips</li><li>Aquarium Station - 200 Atlantic Ave., 65 trips</li><li>Boylston St. at Arlington St., 49 trips</li><li>South Station - 700 Atlantic Ave., 44 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boston Public Library - 700 Boylston St.<br><ol><li>Boston Public Library - 700 Boylston St., 507 trips</li><li>Boylston St. at Arlington St., 262 trips</li><li>Tremont St / West St, 191 trips</li><li>MIT at Mass Ave / Amherst St, 178 trips</li><li>Mayor Martin J Walsh - 28 State St, 170 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lewis Wharf - Atlantic Ave.<br><ol><li>South Station - 700 Atlantic Ave., 300 trips</li><li>Charlestown - Warren St at Chelsea St, 175 trips</li><li>Lewis Wharf - Atlantic Ave., 174 trips</li><li>Rowes Wharf - Atlantic Ave, 136 trips</li><li>Aquarium Station - 200 Atlantic Ave., 122 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boylston St. at Arlington St.<br><ol><li>Boylston St. at Arlington St., 462 trips</li><li>Mayor Martin J Walsh - 28 State St, 191 trips</li><li>Boylston at Fairfield, 179 trips</li><li>The Esplanade - Beacon St. at Arlington St., 172 trips</li><li>Boston Public Library - 700 Boylston St., 164 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Rowes Wharf - Atlantic Ave<br><ol><li>Cross St. at Hanover St., 218 trips</li><li>Lewis Wharf - Atlantic Ave., 211 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 171 trips</li><li>Rowes Wharf - Atlantic Ave, 170 trips</li><li>TD Garden - Causeway at Portal Park #2, 103 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Faneuil Hall - Union St. at North St.<br><ol><li>Faneuil Hall - Union St. at North St., 199 trips</li><li>Boylston St. at Arlington St., 136 trips</li><li>Charlestown - Warren St at Chelsea St, 118 trips</li><li>Charles St at Beacon St, 103 trips</li><li>Boston Public Library - 700 Boylston St., 88 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Cross St. at Hanover St.<br><ol><li>Charlestown - Warren St at Chelsea St, 266 trips</li><li>Cross St. at Hanover St., 264 trips</li><li>South Station - 700 Atlantic Ave., 201 trips</li><li>Tremont St / West St, 168 trips</li><li>Rowes Wharf - Atlantic Ave, 140 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Stuart St. at Charles St.<br><ol><li>Stuart St. at Charles St., 140 trips</li><li>South Station - 700 Atlantic Ave., 106 trips</li><li>Boston Public Library - 700 Boylston St., 83 trips</li><li>Mayor Martin J Walsh - 28 State St, 78 trips</li><li>MIT at Mass Ave / Amherst St, 73 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Post Office Square<br><ol><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 80 trips</li><li>Post Office Square, 64 trips</li><li>Cross St. at Hanover St., 52 trips</li><li>Boylston St. at Arlington St., 51 trips</li><li>Aquarium Station - 200 Atlantic Ave., 44 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boylston St / Berkeley St<br><ol><li>Boylston St / Berkeley St, 87 trips</li><li>Boylston St. at Arlington St., 78 trips</li><li>Boylston St / Washington St, 71 trips</li><li>Mayor Martin J Walsh - 28 State St, 61 trips</li><li>Tremont St / West St, 61 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Tremont St / West St<br><ol><li>Tremont St / West St, 366 trips</li><li>Boylston St. at Arlington St., 179 trips</li><li>The Esplanade - Beacon St. at Arlington St., 174 trips</li><li>Mayor Martin J Walsh - 28 State St, 154 trips</li><li>Cross St. at Hanover St., 117 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Chinatown Gate Plaza - Surface Rd. at Beach St.<br><ol><li>Tremont St. at Berkeley St., 69 trips</li><li>Aquarium Station - 200 Atlantic Ave., 68 trips</li><li>Ink Block, 58 trips</li><li>Chinatown Gate Plaza - Surface Rd. at Beach St., 55 trips</li><li>Rowes Wharf - Atlantic Ave, 48 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Charles Circle - Charles St. at Cambridge St.<br><ol><li>Charles Circle - Charles St. at Cambridge St., 386 trips</li><li>Beacon St / Mass Ave, 164 trips</li><li>MIT at Mass Ave / Amherst St, 157 trips</li><li>Charles St at Beacon St, 153 trips</li><li>Boylston St. at Arlington St., 136 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> The Esplanade - Beacon St. at Arlington St.<br><ol><li>The Esplanade - Beacon St. at Arlington St., 982 trips</li><li>MIT at Mass Ave / Amherst St, 342 trips</li><li>Beacon St / Mass Ave, 221 trips</li><li>Charles Circle - Charles St. at Cambridge St., 162 trips</li><li>Boston Public Library - 700 Boylston St., 152 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boston Convention & Exhibition Center<br><ol><li>South Station - 700 Atlantic Ave., 86 trips</li><li>Tremont St / West St, 77 trips</li><li>Boston Convention & Exhibition Center, 77 trips</li><li>Stuart St. at Charles St., 58 trips</li><li>Franklin St. / Arch St., 52 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boylston St / Washington St<br><ol><li>Boylston St / Washington St, 198 trips</li><li>South Station - 700 Atlantic Ave., 158 trips</li><li>The Esplanade - Beacon St. at Arlington St., 135 trips</li><li>Mayor Martin J Walsh - 28 State St, 104 trips</li><li>Charles St at Beacon St, 101 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Charlestown - Main St at Austin St<br><ol><li>Charlestown - Warren St at Chelsea St, 110 trips</li><li>Cross St. at Hanover St., 73 trips</li><li>TD Garden - Causeway at Portal Park #2, 72 trips</li><li>Charlestown - Main St at Austin St, 66 trips</li><li>John F Fitzgerald - Surface Road at India Street, 49 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Charlestown - Warren St at Chelsea St<br><ol><li>Charlestown - Warren St at Chelsea St, 398 trips</li><li>Cross St. at Hanover St., 330 trips</li><li>TD Garden - Causeway at Portal Park #2, 227 trips</li><li>Faneuil Hall - Union St. at North St., 180 trips</li><li>Charlestown - Main St at Austin St, 178 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1)<br><ol><li>Charlestown - Warren St at Chelsea St, 184 trips</li><li>South Station - 700 Atlantic Ave., 154 trips</li><li>John F Fitzgerald - Surface Road at India Street, 153 trips</li><li>Rowes Wharf - Atlantic Ave, 109 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 100 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Spaulding Rehabilitation Hospital - Charlestown Navy Yard<br><ol><li>Charlestown - Warren St at Chelsea St, 113 trips</li><li>TD Garden - Causeway at Portal Park #2, 96 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 72 trips</li><li>Spaulding Rehabilitation Hospital - Charlestown Navy Yard, 58 trips</li><li>Bunker Hill Community College, 26 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Charles St at Beacon St<br><ol><li>Charles St at Beacon St, 285 trips</li><li>Beacon St / Mass Ave, 165 trips</li><li>MIT at Mass Ave / Amherst St, 145 trips</li><li>The Esplanade - Beacon St. at Arlington St., 144 trips</li><li>Boston Public Library - 700 Boylston St., 132 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Hayes Square at Vine St.<br><ol><li>Charlestown - Warren St at Chelsea St, 66 trips</li><li>Cross St. at Hanover St., 38 trips</li><li>Spaulding Rehabilitation Hospital - Charlestown Navy Yard, 29 trips</li><li>TD Garden - Causeway at Portal Park #2, 26 trips</li><li>Charlestown - Main St at Austin St, 25 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> New Balance Store - Boylston at Dartmouth<br><ol><li>New Balance Store - Boylston at Dartmouth, 73 trips</li><li>Mayor Martin J Walsh - 28 State St, 61 trips</li><li>Boylston St. at Arlington St., 53 trips</li><li>Charles Circle - Charles St. at Cambridge St., 51 trips</li><li>Boylston St / Washington St, 48 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Brighton Center<br><ol><li>Central Square at Mass Ave / Essex St, 32 trips</li><li>Brighton Center, 27 trips</li><li>Union Square - Brighton Ave. at Cambridge St., 25 trips</li><li>B.U. Central - 725 Comm. Ave., 25 trips</li><li>Kenmore Sq / Comm Ave, 24 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Washington St at Brock St<br><ol><li>Washington St at Brock St, 106 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 23 trips</li><li>Kenmore Sq / Comm Ave, 12 trips</li><li>Harvard University Transportation Services - 175 North Harvard St, 11 trips</li><li>The Esplanade - Beacon St. at Arlington St., 11 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Market St at Faneuil St<br><ol><li>Market St at Faneuil St, 7 trips</li><li>Union Square - Brighton Ave. at Cambridge St., 5 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 4 trips</li><li>Innovation Lab - 125 Western Ave. at Batten Way, 2 trips</li><li>Packard's Corner - Comm. Ave. at Brighton Ave., 2 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Oak Square YMCA<br><ol><li>Oak Square YMCA, 9 trips</li><li>Harvard Real Estate - Brighton Mills - 370 Western Ave, 4 trips</li><li>Kenmore Sq / Comm Ave, 3 trips</li><li>Allston Green District - Commonwealth Ave & Griggs St, 2 trips</li><li>Washington Square at Washington St. / Beacon St., 2 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Curtis Hall at South Street<br><ol><li>Curtis Hall at South Street, 163 trips</li><li>Green St T, 45 trips</li><li>Hyde Square at Barbara St, 39 trips</li><li>Jackson Square T at Centre St, 32 trips</li><li>Ruggles Station / Columbus Ave., 31 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Hyde Square at Barbara St<br><ol><li>Curtis Hall at South Street, 48 trips</li><li>Landmark Centre, 29 trips</li><li>Hyde Square at Barbara St, 19 trips</li><li>Colleges of the Fenway, 18 trips</li><li>Christian Science Plaza, 15 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Egleston Square at Columbus Ave<br><ol><li>Porter Square Station, 20 trips</li><li>Roxbury Crossing Station, 17 trips</li><li>Egleston Square at Columbus Ave, 15 trips</li><li>Franklin Park Zoo, 13 trips</li><li>Christian Science Plaza, 11 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Green St T<br><ol><li>Curtis Hall at South Street, 43 trips</li><li>Green St T, 43 trips</li><li>Jackson Square T at Centre St, 30 trips</li><li>Back Bay / South End Station, 28 trips</li><li>Ruggles Station / Columbus Ave., 23 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Jackson Square T at Centre St<br><ol><li>Ruggles Station / Columbus Ave., 58 trips</li><li>Green St T, 53 trips</li><li>Jackson Square T at Centre St, 38 trips</li><li>Back Bay / South End Station, 35 trips</li><li>Curtis Hall at South Street, 25 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Heath St at South Huntington<br><ol><li>Curtis Hall at South Street, 16 trips</li><li>Heath St at South Huntington, 16 trips</li><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 9 trips</li><li>Yawkey Way at Boylston St., 9 trips</li><li>Brigham Cir / Huntington Ave, 9 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Coolidge Corner - Beacon St @ Centre St<br><ol><li>Coolidge Corner - Beacon St @ Centre St, 81 trips</li><li>Washington Square at Washington St. / Beacon St., 52 trips</li><li>Landmark Centre, 47 trips</li><li>Boylston St. at Arlington St., 37 trips</li><li>Kenmore Sq / Comm Ave, 30 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Washington Square at Washington St. / Beacon St.<br><ol><li>Washington Square at Washington St. / Beacon St., 40 trips</li><li>Coolidge Corner - Beacon St @ Centre St, 37 trips</li><li>Kenmore Sq / Comm Ave, 28 trips</li><li>Landmark Centre, 21 trips</li><li>Northeastern U / North Parking Lot, 19 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> JFK Crossing at Harvard St. / Thorndike St.<br><ol><li>Longwood Ave / Binney St, 91 trips</li><li>JFK Crossing at Harvard St. / Thorndike St., 45 trips</li><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 21 trips</li><li>Coolidge Corner - Beacon St @ Centre St, 21 trips</li><li>Harvard University Transportation Services - 175 North Harvard St, 20 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Brookline Village - Station Street @ MBTA<br><ol><li>Brookline Village - Station Street @ MBTA, 47 trips</li><li>Christian Science Plaza, 31 trips</li><li>Landmark Centre, 25 trips</li><li>Boylston / Mass Ave, 23 trips</li><li>Curtis Hall at South Street, 20 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lechmere Station at Cambridge St / First St<br><ol><li>Lechmere Station at Cambridge St / First St, 118 trips</li><li>Cambridge St - at Columbia St / Webster Ave, 115 trips</li><li>Faneuil Hall - Union St. at North St., 74 trips</li><li>Harvard Square at Mass Ave/ Dunster, 72 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 68 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> One Kendall Square at Hampshire St / Portland St<br><ol><li>MIT at Mass Ave / Amherst St, 114 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 111 trips</li><li>Porter Square Station, 102 trips</li><li>Harvard Square at Mass Ave/ Dunster, 78 trips</li><li>One Kendall Square at Hampshire St / Portland St, 74 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> One Broadway / Kendall Sq at Main St / 3rd St<br><ol><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 187 trips</li><li>MIT at Mass Ave / Amherst St, 94 trips</li><li>One Broadway / Kendall Sq at Main St / 3rd St, 85 trips</li><li>Lechmere Station at Cambridge St / First St, 84 trips</li><li>Charles Circle - Charles St. at Cambridge St., 81 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Kendall T<br><ol><li>Harvard Square at Mass Ave/ Dunster, 165 trips</li><li>MIT at Mass Ave / Amherst St, 145 trips</li><li>Kendall T, 107 trips</li><li>Charles Circle - Charles St. at Cambridge St., 100 trips</li><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 100 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT Stata Center at Vassar St / Main St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 190 trips</li><li>MIT Stata Center at Vassar St / Main St, 125 trips</li><li>MIT at Mass Ave / Amherst St, 104 trips</li><li>MIT Vassar St, 89 trips</li><li>Central Square at Mass Ave / Essex St, 76 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT at Mass Ave / Amherst St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 712 trips</li><li>MIT at Mass Ave / Amherst St, 444 trips</li><li>The Esplanade - Beacon St. at Arlington St., 236 trips</li><li>Central Square at Mass Ave / Essex St, 235 trips</li><li>Beacon St / Mass Ave, 208 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Cambridge St - at Columbia St / Webster Ave<br><ol><li>Central Square at Mass Ave / Essex St, 176 trips</li><li>Lechmere Station at Cambridge St / First St, 133 trips</li><li>Harvard Square at Mass Ave/ Dunster, 84 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 84 trips</li><li>Ames St at Main St, 83 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lafayette Square at Mass Ave / Main St / Columbia St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 293 trips</li><li>MIT at Mass Ave / Amherst St, 131 trips</li><li>Beacon St / Mass Ave, 85 trips</li><li>Harvard Square at Brattle St / Eliot St, 70 trips</li><li>Lafayette Square at Mass Ave / Main St / Columbia St, 58 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Inman Square at Vellucci Plaza / Hampshire St<br><ol><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 201 trips</li><li>Central Square at Mass Ave / Essex St, 100 trips</li><li>Harvard Square at Mass Ave/ Dunster, 96 trips</li><li>Lechmere Station at Cambridge St / First St, 63 trips</li><li>One Kendall Square at Hampshire St / Portland St, 56 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Central Square at Mass Ave / Essex St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 406 trips</li><li>Cambridge St - at Columbia St / Webster Ave, 231 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 191 trips</li><li>MIT at Mass Ave / Amherst St, 140 trips</li><li>Lower Cambridgeport at Magazine St/Riverside Rd, 135 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 311 trips</li><li>MIT at Mass Ave / Amherst St, 171 trips</li><li>Harvard Square at Brattle St / Eliot St, 110 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 101 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 93 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Cambridge Main Library at Broadway / Trowbridge St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 123 trips</li><li>Cambridge Main Library at Broadway / Trowbridge St, 95 trips</li><li>MIT at Mass Ave / Amherst St, 62 trips</li><li>Harvard Square at Brattle St / Eliot St, 50 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 39 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University Housing - 115 Putnam Ave at Peabody Terrace<br><ol><li>Harvard Square at Mass Ave/ Dunster, 151 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 109 trips</li><li>Harvard Square at Brattle St / Eliot St, 84 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 79 trips</li><li>Central Square at Mass Ave / Essex St, 75 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Kennedy School at Bennett St / Eliot St<br><ol><li>MIT at Mass Ave / Amherst St, 156 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 144 trips</li><li>Harvard Law School at Mass Ave / Jarvis St, 98 trips</li><li>The Esplanade - Beacon St. at Arlington St., 97 trips</li><li>Harvard University River Houses at DeWolfe St / Cowperthwaite St, 87 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Square at Brattle St / Eliot St<br><ol><li>Harvard Square at Brattle St / Eliot St, 252 trips</li><li>MIT at Mass Ave / Amherst St, 219 trips</li><li>Beacon St / Mass Ave, 84 trips</li><li>The Esplanade - Beacon St. at Arlington St., 83 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 83 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Square at Mass Ave/ Dunster<br><ol><li>MIT at Mass Ave / Amherst St, 685 trips</li><li>Harvard Square at Mass Ave/ Dunster, 483 trips</li><li>Lafayette Square at Mass Ave / Main St / Columbia St, 220 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 216 trips</li><li>Beacon St / Mass Ave, 211 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> CambridgeSide Galleria - CambridgeSide PL at Land Blvd<br><ol><li>One Broadway / Kendall Sq at Main St / 3rd St, 135 trips</li><li>MIT at Mass Ave / Amherst St, 88 trips</li><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 72 trips</li><li>Kendall T, 61 trips</li><li>Faneuil Hall - Union St. at North St., 52 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Law School at Mass Ave / Jarvis St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 142 trips</li><li>Harvard Square at Brattle St / Eliot St, 117 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 97 trips</li><li>Harvard Law School at Mass Ave / Jarvis St, 73 trips</li><li>MIT at Mass Ave / Amherst St, 49 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University Gund Hall at Quincy St / Kirkland S<br><ol><li>Harvard Square at Mass Ave/ Dunster, 148 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 116 trips</li><li>MIT at Mass Ave / Amherst St, 91 trips</li><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 66 trips</li><li>Lechmere Station at Cambridge St / First St, 56 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lower Cambridgeport at Magazine St/Riverside Rd<br><ol><li>Harvard Square at Mass Ave/ Dunster, 157 trips</li><li>Lower Cambridgeport at Magazine St/Riverside Rd, 118 trips</li><li>Central Square at Mass Ave / Essex St, 115 trips</li><li>Harvard University River Houses at DeWolfe St / Cowperthwaite St, 114 trips</li><li>MIT at Mass Ave / Amherst St, 100 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 65 trips</li><li>MIT at Mass Ave / Amherst St, 45 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 45 trips</li><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 44 trips</li><li>Harvard Square at Brattle St / Eliot St, 42 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University Radcliffe Quadrangle at Shepard St / Garden St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 155 trips</li><li>Harvard Square at Brattle St / Eliot St, 83 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 78 trips</li><li>Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St, 54 trips</li><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 52 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Linear Park - Mass. Ave. at Cameron Ave. <br><ol><li>Davis Square, 278 trips</li><li>Alewife Station at Russell Field, 212 trips</li><li>Linear Park - Mass. Ave. at Cameron Ave. , 119 trips</li><li>Harvard Square at Brattle St / Eliot St, 36 trips</li><li>Porter Square Station, 29 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> 359 Broadway - Broadway at Fayette Street<br><ol><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 135 trips</li><li>Harvard Square at Mass Ave/ Dunster, 105 trips</li><li>Harvard Square at Brattle St / Eliot St, 59 trips</li><li>MIT Stata Center at Vassar St / Main St, 57 trips</li><li>One Kendall Square at Hampshire St / Portland St, 52 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Binney St / Sixth St<br><ol><li>Nashua Street at Red Auerbach Way, 77 trips</li><li>MIT Stata Center at Vassar St / Main St, 62 trips</li><li>MIT at Mass Ave / Amherst St, 46 trips</li><li>Agganis Arena - 925 Comm Ave., 39 trips</li><li>One Broadway / Kendall Sq at Main St / 3rd St, 38 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Porter Square Station<br><ol><li>Mt Auburn, 92 trips</li><li>One Kendall Square at Hampshire St / Portland St, 91 trips</li><li>Conway Park - Somerville Avenue, 88 trips</li><li>Harvard Square at Brattle St / Eliot St, 67 trips</li><li>Danehy Park, 67 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Dana Park<br><ol><li>Central Square at Mass Ave / Essex St, 62 trips</li><li>Dana Park, 53 trips</li><li>MIT at Mass Ave / Amherst St, 31 trips</li><li>Harvard Square at Mass Ave/ Dunster, 30 trips</li><li>Lower Cambridgeport at Magazine St/Riverside Rd, 30 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Danehy Park<br><ol><li>Danehy Park, 208 trips</li><li>Porter Square Station, 90 trips</li><li>Alewife Station at Russell Field, 32 trips</li><li>Harvard Square at Brattle St / Eliot St, 25 trips</li><li>Harvard Square at Mass Ave/ Dunster, 16 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Kendall Street<br><ol><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 135 trips</li><li>Kendall Street, 60 trips</li><li>Lechmere Station at Cambridge St / First St, 45 trips</li><li>Lafayette Square at Mass Ave / Main St / Columbia St, 41 trips</li><li>Harvard Square at Mass Ave/ Dunster, 41 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Alewife Station at Russell Field<br><ol><li>Alewife Station at Russell Field, 159 trips</li><li>Linear Park - Mass. Ave. at Cameron Ave. , 78 trips</li><li>Davis Square, 72 trips</li><li>Harvard Square at Brattle St / Eliot St, 63 trips</li><li>Lechmere Station at Cambridge St / First St, 44 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> EF - North Point Park<br><ol><li>EF - North Point Park, 167 trips</li><li>Charlestown - Warren St at Chelsea St, 140 trips</li><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 42 trips</li><li>One Kendall Square at Hampshire St / Portland St, 40 trips</li><li>MIT Stata Center at Vassar St / Main St, 40 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Rindge Avenue - O'Neill Library<br><ol><li>One Kendall Square at Hampshire St / Portland St, 37 trips</li><li>Davis Square, 27 trips</li><li>Porter Square Station, 18 trips</li><li>Harvard Square at Brattle St / Eliot St, 16 trips</li><li>Harvard Square at Mass Ave/ Dunster, 15 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Ames St at Main St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 158 trips</li><li>MIT at Mass Ave / Amherst St, 139 trips</li><li>Ames St at Main St, 120 trips</li><li>Charles Circle - Charles St. at Cambridge St., 90 trips</li><li>Lechmere Station at Cambridge St / First St, 86 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University River Houses at DeWolfe St / Cowperthwaite St<br><ol><li>Harvard University River Houses at DeWolfe St / Cowperthwaite St, 358 trips</li><li>Harvard Square at Mass Ave/ Dunster, 228 trips</li><li>MIT at Mass Ave / Amherst St, 172 trips</li><li>Beacon St / Mass Ave, 114 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 106 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lesley University<br><ol><li>Davis Square, 36 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 27 trips</li><li>Harvard Square at Brattle St / Eliot St, 25 trips</li><li>Harvard Square at Mass Ave/ Dunster, 25 trips</li><li>Lesley University, 20 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> University Park<br><ol><li>Harvard Square at Mass Ave/ Dunster, 223 trips</li><li>University Park, 86 trips</li><li>MIT at Mass Ave / Amherst St, 85 trips</li><li>Harvard Square at Brattle St / Eliot St, 48 trips</li><li>Binney St / Sixth St, 41 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT Pacific St at Purrington St<br><ol><li>MIT Pacific St at Purrington St, 87 trips</li><li>Central Square at Mass Ave / Essex St, 41 trips</li><li>Ames St at Main St, 35 trips</li><li>Harvard Square at Mass Ave/ Dunster, 31 trips</li><li>Kendall T, 25 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT Vassar St<br><ol><li>MIT Stata Center at Vassar St / Main St, 131 trips</li><li>MIT at Mass Ave / Amherst St, 101 trips</li><li>MIT Vassar St, 95 trips</li><li>Ames St at Main St, 75 trips</li><li>Harvard Square at Mass Ave/ Dunster, 62 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Mt Auburn<br><ol><li>Porter Square Station, 90 trips</li><li>Mt Auburn, 58 trips</li><li>Harvard Square at Brattle St / Eliot St, 53 trips</li><li>Harvard Square at Mass Ave/ Dunster, 48 trips</li><li>Lower Cambridgeport at Magazine St/Riverside Rd, 31 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Alewife MBTA at Steel Place<br><ol><li>Alewife MBTA at Steel Place, 56 trips</li><li>Davis Square, 9 trips</li><li>Harvard Square at Mass Ave/ Dunster, 5 trips</li><li>Alewife Station at Russell Field, 5 trips</li><li>Powder House Circle - Nathan Tufts Park, 5 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Sidney Research Campus/ Erie Street at Waverly<br><ol><li>Back Bay / South End Station, 8 trips</li><li>Charles St at Beacon St, 4 trips</li><li>Kendall T, 4 trips</li><li>Central Square at Mass Ave / Essex St, 4 trips</li><li>Ames St at Main St, 4 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Third at Binney<br><ol><li>Nashua Street at Red Auerbach Way, 10 trips</li><li>Kenmore Sq / Comm Ave, 5 trips</li><li>Third at Binney, 5 trips</li><li>Union Square - Somerville, 5 trips</li><li>MIT at Mass Ave / Amherst St, 3 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Brian P. Murphy Staircase at Child Street<br><ol><li>Brian P. Murphy Staircase at Child Street, 22 trips</li><li>Charlestown - Warren St at Chelsea St, 8 trips</li><li>Beacon St / Mass Ave, 6 trips</li><li>Cambridge St - at Columbia St / Webster Ave, 6 trips</li><li>Charles Circle - Charles St. at Cambridge St., 5 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Somerville City Hall<br><ol><li>Davis Square, 37 trips</li><li>Union Square - Somerville, 31 trips</li><li>Somerville City Hall, 26 trips</li><li>Harvard Square at Mass Ave/ Dunster, 23 trips</li><li>Conway Park - Somerville Avenue, 21 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Union Square - Somerville<br><ol><li>Central Square at Mass Ave / Essex St, 48 trips</li><li>Davis Square, 44 trips</li><li>Lechmere Station at Cambridge St / First St, 43 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 34 trips</li><li>Union Square - Somerville, 33 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Beacon St at Washington / Kirkland<br><ol><li>Harvard Square at Mass Ave/ Dunster, 68 trips</li><li>Beacon St at Washington / Kirkland, 36 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 31 trips</li><li>Harvard Square at Brattle St / Eliot St, 28 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 24 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Conway Park - Somerville Avenue<br><ol><li>Porter Square Station, 55 trips</li><li>Davis Square, 47 trips</li><li>Harvard Square at Mass Ave/ Dunster, 42 trips</li><li>Powder House Circle - Nathan Tufts Park, 37 trips</li><li>Union Square - Somerville, 28 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Wilson Square<br><ol><li>Porter Square Station, 39 trips</li><li>Davis Square, 37 trips</li><li>Harvard Square at Mass Ave/ Dunster, 24 trips</li><li>Harvard Square at Brattle St / Eliot St, 21 trips</li><li>Conway Park - Somerville Avenue, 15 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Davis Square<br><ol><li>Linear Park - Mass. Ave. at Cameron Ave. , 251 trips</li><li>Davis Square, 214 trips</li><li>Packard Ave / Powderhouse Blvd, 141 trips</li><li>Alewife Station at Russell Field, 121 trips</li><li>Harvard Square at Mass Ave/ Dunster, 71 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Powder House Circle - Nathan Tufts Park<br><ol><li>Davis Square, 57 trips</li><li>Powder House Circle - Nathan Tufts Park, 46 trips</li><li>Harvard Square at Mass Ave/ Dunster, 33 trips</li><li>Magoun Square at Trum Field, 22 trips</li><li>Porter Square Station, 18 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Packard Ave / Powderhouse Blvd<br><ol><li>Davis Square, 96 trips</li><li>Packard Ave / Powderhouse Blvd, 24 trips</li><li>Porter Square Station, 16 trips</li><li>Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St, 15 trips</li><li>Harvard Square at Brattle St / Eliot St, 9 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Somerville Hospital at Highland Ave / Crocker St<br><ol><li>Davis Square, 16 trips</li><li>Cambridge St - at Columbia St / Webster Ave, 12 trips</li><li>Lechmere Station at Cambridge St / First St, 10 trips</li><li>Tremont St / W Newton St, 8 trips</li><li>Somerville Hospital at Highland Ave / Crocker St, 8 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Teele Square at 239 Holland St<br><ol><li>Davis Square, 88 trips</li><li>Teele Square at 239 Holland St, 17 trips</li><li>Porter Square Station, 14 trips</li><li>Packard Ave / Powderhouse Blvd, 9 trips</li><li>Harvard Square at Mass Ave/ Dunster, 8 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Magoun Square at Trum Field<br><ol><li>Davis Square, 32 trips</li><li>Magoun Square at Trum Field, 22 trips</li><li>Lechmere Station at Cambridge St / First St, 15 trips</li><li>Alewife Station at Russell Field, 8 trips</li><li>Porter Square Station, 7 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Broadway St at Mt Pleasant St<br><ol><li>Broadway St at Mt Pleasant St, 44 trips</li><li>Charlestown - Warren St at Chelsea St, 28 trips</li><li>Charlestown - Main St at Austin St, 26 trips</li><li>Union Square - Somerville, 20 trips</li><li>TD Garden - Causeway at Portal Park #2, 10 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Upham's Corner - Ramsey St at Dudley St<br><ol><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 37 trips</li><li>Washington St. at Waltham St., 8 trips</li><li>Wentworth Institute of Technology, 3 trips</li><li>Agganis Arena - 925 Comm Ave., 2 trips</li><li>Boylston at Fairfield, 2 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> 18 Dorrance Warehouse<br><ol><li>18 Dorrance Warehouse, 2 trips</li></ol></div>"},"illustration_popular-routes0startYear2016startMonthstartWeekdaystartHourstationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199member1gender":{"direction":{"1":["10","113","37","101","33"],"2":["12","38","4","3","138"],"3":["4","38","8","12","169"],"4":["3","12","38","14","4"],"5":["43","31","129","39","142"],"6":["148","11","7","146","15"],"7":["148","146","142","147","145"],"8":["3","129","8","4","38"],"9":["61","93","65","10","60"],"10":["97","33","81","99","101"],"11":["15","6","146","148","7"],"12":["4","38","3","14","2"],"13":["10","97","113","106","101"],"14":["5","4","12","38","3"],"15":["148","146","11","7","147"],"16":["13","100","111","17","103"],"17":["149","16","135","133","136"],"18":["66","68","10","137","149"],"19":["113","10","104","101","93"],"20":["24","23","25","28","21"],"21":["24","28","21","20","25"],"22":["22","23","26","24","25"],"23":["23","25","22","26","24"],"24":["23","25","24","21","28"],"25":["23","25","28","22","24"],"26":["23","22","26","27","25"],"27":["25","27","28","20","23"],"28":["25","23","21","28","182"],"29":["24","23","25"],"30":["138","98","10","107","96"],"31":["127","5","43","59","32"],"32":["43","31","35","46","129"],"33":["10","81","101","97","68"],"34":["64","60","96","65","138"],"35":["32","31","5","40","65"],"36":["101","33","113","37","10"],"37":["10","91","113","97","102"],"38":["138","137","3","134","12"],"39":["46","38","5","34","138"],"40":["39","40","41","65","66"],"41":["40","59","43","132","48"],"42":["10","113","99","103","37"],"43":["32","5","31","41","38"],"44":["138","137","44","142","38"],"45":["59","10","41","63","125"],"46":["39","138","96","104","61"],"47":["5","32","137","18","34"],"48":["41","48","65","40","43"],"49":["31","45","50","34","93"],"50":["128","41","49","113","125"],"51":["41","34","70","46","75"],"52":["61","65","31","64","93"],"53":["41","13","127","125","45"],"54":["34","49","71","44","70"],"55":["43","76","79","110","55"],"56":["138","56","49","78","137"],"57":["55","38","57","79","61"],"58":["10","106","95","37","103"],"59":["41","31","127","40","5"],"60":["61","34","82","10","65"],"61":["64","9","60","137","10"],"62":["61","5","32","60","59"],"63":["10","63","104","31","34"],"64":["61","10","65","93","34"],"65":["64","34","10","93","32"],"66":["10","105","96","107","18"],"67":["10","68","42","67","93"],"68":["113","10","18","94","101"],"69":["68","42","60","84","104"],"70":["71","70","81","60","80"],"71":["70","71","80","89","87"],"72":["46","60","34","63","35"],"73":["10","68","81","13","67"],"74":["10","81","61","98","73"],"75":["95","38","58","68","19"],"76":["85","93","63","34","41"],"77":["10","88","33","78","77"],"78":["10","33","88","36","68"],"79":["60","69","34","64","31"],"80":["80","10","85","74","88"],"81":["10","33","68","85","81"],"82":["10","60","64","93","61"],"83":["83","127","125","31","86"],"84":["10","85","101","69","73"],"85":["68","10","61","81","84"],"86":["86","72","83","125","49"],"87":["78","10","97","37","87"],"88":["77","78","113","10","36"],"89":["37","39","71","89","106"],"90":["18","101","33","10","97"],"91":["99","107","10","133","135"],"92":["159","12","67","6","166"],"93":["95","61","64","10","65"],"94":["10","114","68","112","13"],"95":["13","108","113","115","93"],"96":["10","110","34","105","115"],"97":["10","99","13","19","33"],"98":["10","99","105","107","30"],"99":["97","101","113","94","112"],"100":["10","68","114","95","112"],"101":["10","68","99","97","112"],"102":["10","96","37","39","106"],"103":["113","18","68","101","91"],"104":["10","110","107","113","115"],"105":["98","108","96","58","66"],"106":["58","82","113","37","93"],"107":["98","66","136","96","138"],"108":["108","10","138","44","107"],"109":["10","80","101","73","84"],"110":["10","96","37","64","66"],"111":["37","112","101","114","135"],"112":["114","113","94","10","101"],"113":["68","10","13","114","103"],"114":["94","113","112","100","133"],"115":["96","66","95","44","98"],"116":["95","113","101","103","94"],"117":["10","30","106","99","110"],"118":["2","4","38","130","12"],"119":["32","142","2","38","118"],"120":["3","137","32","2","38"],"121":["5","150","38","2","119"],"122":["126","43","124","122","32"],"124":["122","41","127","37","5"],"125":["43","45","126","35","125"],"126":["122","127","59","39","31"],"127":["31","59","61","126","127"],"128":["40","41","8","5","60"],"129":["5","32","8","3","130"],"130":["129","60","38","138","32"],"131":["32","5","129","41","40"],"132":["43","41","129","12","46"],"133":["137","139","163","136","165"],"134":["141","158","137","136","138"],"135":["149","133","138","141","170"],"136":["138","169","170","137","149"],"137":["170","169","138","142","168"],"138":["170","44","142","169","137"],"139":["142","137","138","133","165"],"140":["138","169","137","170","136"],"141":["143","137","151","142","136"],"142":["138","169","137","145","170"],"143":["138","137","141","148","153"],"144":["148","137","142","141","143"],"145":["148","146","142","151","153"],"146":["145","15","7","150","6"],"147":["154","145","150","15","171"],"148":["154","145","138","143","166"],"149":["136","135","137","18","161"],"150":["147","148","158","146","167"],"151":["154","141","178","148","145"],"152":["170","138","137","142","166"],"153":["148","147","154","145","158"],"154":["148","151","147","153","146"],"155":["181","162","158","155","148"],"156":["143","137","144","165","142"],"157":["137","18","133","158","113"],"158":["179","134","157","147","160"],"159":["142","137","138","152","143"],"160":["158","154","147","160","148"],"161":["149","133","137","18","91"],"162":["162","181","155","147","158"],"163":["133","114","163","94","112"],"164":["158","181","147","134","148"],"165":["170","169","138","142","168"],"166":["146","148","152","153","166"],"167":["147","181","153","148","151"],"168":["170","138","169","142","137"],"169":["137","138","136","142","170"],"170":["137","138","165","136","142"],"171":["147","158","146","148","138"],"172":["181","172","147","155","166"],"173":["142","136","168","137","165"],"174":["138","136","137","169","133"],"175":["136","157","103","135","137"],"176":["137","181","133","179","158"],"177":["133","142","137","153","139"],"178":["148","137","151","153","142"],"179":["137","158","151","153","150"],"180":["158","148","147","181","151"],"181":["155","185","183","186","182"],"182":["181","158","186","179","182"],"183":["181","179","158","137","182"],"184":["158","181","34","137","141"],"185":["181","158","185","134","155"],"186":["181","158","153","134","180"],"187":["114","177","138","187","186"],"191":["81","93","63","69","45"],"199":["199","143","179","15","111"]},"description":"<div class=\"results_title\">Most frequent stops from selected start stations</div><div class=\"results_group\"><strong>From:</strong> Fan Pier<br><ol><li>South Station - 700 Atlantic Ave., 396 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 367 trips</li><li>Mayor Martin J Walsh - 28 State St, 292 trips</li><li>Cross St. at Hanover St., 205 trips</li><li>Aquarium Station - 200 Atlantic Ave., 199 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Union Square - Brighton Ave. at Cambridge St.<br><ol><li>Packard's Corner - Comm. Ave. at Brighton Ave., 162 trips</li><li>Kenmore Sq / Comm Ave, 160 trips</li><li>B.U. Central - 725 Comm. Ave., 150 trips</li><li>Agganis Arena - 925 Comm Ave., 121 trips</li><li>MIT at Mass Ave / Amherst St, 116 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Agganis Arena - 925 Comm Ave.<br><ol><li>B.U. Central - 725 Comm. Ave., 656 trips</li><li>Kenmore Sq / Comm Ave, 522 trips</li><li>Buswell St. at Park Dr., 505 trips</li><li>Packard's Corner - Comm. Ave. at Brighton Ave., 349 trips</li><li>MIT Pacific St at Purrington St, 224 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> B.U. Central - 725 Comm. Ave.<br><ol><li>Agganis Arena - 925 Comm Ave., 914 trips</li><li>Packard's Corner - Comm. Ave. at Brighton Ave., 590 trips</li><li>Kenmore Sq / Comm Ave, 349 trips</li><li>Allston Green District - Commonwealth Ave & Griggs St, 263 trips</li><li>B.U. Central - 725 Comm. Ave., 199 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Longwood Ave / Binney St<br><ol><li>Landmark Centre, 569 trips</li><li>Ruggles Station / Columbus Ave., 525 trips</li><li>Coolidge Corner - Beacon St @ Centre St, 460 trips</li><li>Yawkey Way at Boylston St., 366 trips</li><li>Central Square at Mass Ave / Essex St, 328 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Real Estate - Brighton Mills - 370 Western Ave<br><ol><li>Harvard Square at Mass Ave/ Dunster, 278 trips</li><li>Innovation Lab - 125 Western Ave. at Batten Way, 204 trips</li><li>Harvard University Housing - 111 Western Ave. at Soldiers Field Park , 200 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 172 trips</li><li>Harvard University Transportation Services - 175 North Harvard St, 115 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University Housing - 111 Western Ave. at Soldiers Field Park <br><ol><li>Harvard Square at Mass Ave/ Dunster, 477 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 428 trips</li><li>Central Square at Mass Ave / Essex St, 391 trips</li><li>Harvard Square at Brattle St / Eliot St, 328 trips</li><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 316 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Buswell St. at Park Dr.<br><ol><li>Agganis Arena - 925 Comm Ave., 565 trips</li><li>Coolidge Corner - Beacon St @ Centre St, 255 trips</li><li>Buswell St. at Park Dr., 214 trips</li><li>B.U. Central - 725 Comm. Ave., 186 trips</li><li>Kenmore Sq / Comm Ave, 186 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Tremont St / W Newton St<br><ol><li>Back Bay / South End Station, 853 trips</li><li>Washington St. at Waltham St., 285 trips</li><li>Prudential Center / Belvidere, 274 trips</li><li>South Station - 700 Atlantic Ave., 259 trips</li><li>Boston Medical Center - East Concord at Harrison Ave, 219 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> South Station - 700 Atlantic Ave.<br><ol><li>Lewis Wharf - Atlantic Ave., 1314 trips</li><li>Aquarium Station - 200 Atlantic Ave., 1016 trips</li><li>State Street at Channel Center, 1015 trips</li><li>Rowes Wharf - Atlantic Ave, 893 trips</li><li>Cross St. at Hanover St., 815 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Innovation Lab - 125 Western Ave. at Batten Way<br><ol><li>Harvard University Transportation Services - 175 North Harvard St, 387 trips</li><li>Harvard Real Estate - Brighton Mills - 370 Western Ave, 219 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 218 trips</li><li>Harvard Square at Mass Ave/ Dunster, 203 trips</li><li>Harvard University Housing - 111 Western Ave. at Soldiers Field Park , 193 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Packard's Corner - Comm. Ave. at Brighton Ave.<br><ol><li>B.U. Central - 725 Comm. Ave., 475 trips</li><li>Kenmore Sq / Comm Ave, 386 trips</li><li>Agganis Arena - 925 Comm Ave., 345 trips</li><li>Allston Green District - Commonwealth Ave & Griggs St, 342 trips</li><li>Union Square - Brighton Ave. at Cambridge St., 241 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> John F Fitzgerald - Surface Road at India Street<br><ol><li>South Station - 700 Atlantic Ave., 537 trips</li><li>Lewis Wharf - Atlantic Ave., 370 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 324 trips</li><li>Chinatown Gate Plaza - Surface Rd. at Beach St., 240 trips</li><li>Cross St. at Hanover St., 200 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Allston Green District - Commonwealth Ave & Griggs St<br><ol><li>Longwood Ave / Binney St, 416 trips</li><li>B.U. Central - 725 Comm. Ave., 236 trips</li><li>Packard's Corner - Comm. Ave. at Brighton Ave., 223 trips</li><li>Kenmore Sq / Comm Ave, 212 trips</li><li>Agganis Arena - 925 Comm Ave., 209 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University Transportation Services - 175 North Harvard St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 753 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 426 trips</li><li>Innovation Lab - 125 Western Ave. at Batten Way, 357 trips</li><li>Harvard University Housing - 111 Western Ave. at Soldiers Field Park , 275 trips</li><li>Harvard Square at Brattle St / Eliot St, 246 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Edwards Playground - Main Street & Eden Street<br><ol><li>John F Fitzgerald - Surface Road at India Street, 197 trips</li><li>Faneuil Hall - Union St. at North St., 182 trips</li><li>Charlestown - Main St at Austin St, 160 trips</li><li>Bunker Hill Community College, 110 trips</li><li>Post Office Square, 99 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Bunker Hill Community College<br><ol><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 155 trips</li><li>Edwards Playground - Main Street & Eden Street, 141 trips</li><li>One Broadway / Kendall Sq at Main St / 3rd St, 139 trips</li><li>Lechmere Station at Cambridge St / First St, 136 trips</li><li>Kendall T, 85 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Nashua Street at Red Auerbach Way<br><ol><li>Boylston at Fairfield, 322 trips</li><li>Congress / Sleeper, 316 trips</li><li>South Station - 700 Atlantic Ave., 291 trips</li><li>MIT Stata Center at Vassar St / Main St, 282 trips</li><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 215 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Purchase St at Pearl St<br><ol><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 237 trips</li><li>South Station - 700 Atlantic Ave., 216 trips</li><li>Boylston St / Berkeley St, 212 trips</li><li>Cross St. at Hanover St., 164 trips</li><li>Washington St. at Waltham St., 156 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Chelsea St at Saratoga St<br><ol><li>EBNHC - 20 Maverick Sq, 5 trips</li><li>Maverick Sq - Lewis Mall, 2 trips</li><li>Airport T Stop - Bremen St at Brooks St, 2 trips</li><li>Orient Heights T Stop - Bennington St at Saratoga St, 2 trips</li><li>Bennington St at Byron St, 1 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Bennington St at Byron St<br><ol><li>EBNHC - 20 Maverick Sq, 9 trips</li><li>Orient Heights T Stop - Bennington St at Saratoga St, 4 trips</li><li>Bennington St at Byron St, 3 trips</li><li>Chelsea St at Saratoga St, 1 trips</li><li>Airport T Stop - Bremen St at Brooks St, 1 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Piers Park- Marginal St at East Boston Shipyard<br><ol><li>Piers Park- Marginal St at East Boston Shipyard, 16 trips</li><li>Maverick Sq - Lewis Mall, 11 trips</li><li>The Eddy at New Street, 4 trips</li><li>EBNHC - 20 Maverick Sq, 3 trips</li><li>Airport T Stop - Bremen St at Brooks St, 3 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Maverick Sq - Lewis Mall<br><ol><li>Maverick Sq - Lewis Mall, 43 trips</li><li>Airport T Stop - Bremen St at Brooks St, 34 trips</li><li>Piers Park- Marginal St at East Boston Shipyard, 12 trips</li><li>The Eddy at New Street, 10 trips</li><li>EBNHC - 20 Maverick Sq, 9 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> EBNHC - 20 Maverick Sq<br><ol><li>Maverick Sq - Lewis Mall, 18 trips</li><li>Airport T Stop - Bremen St at Brooks St, 18 trips</li><li>EBNHC - 20 Maverick Sq, 12 trips</li><li>Bennington St at Byron St, 5 trips</li><li>Orient Heights T Stop - Bennington St at Saratoga St, 4 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Airport T Stop - Bremen St at Brooks St<br><ol><li>Maverick Sq - Lewis Mall, 42 trips</li><li>Airport T Stop - Bremen St at Brooks St, 23 trips</li><li>Orient Heights T Stop - Bennington St at Saratoga St, 8 trips</li><li>Piers Park- Marginal St at East Boston Shipyard, 6 trips</li><li>EBNHC - 20 Maverick Sq, 5 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> The Eddy at New Street<br><ol><li>Maverick Sq - Lewis Mall, 19 trips</li><li>Piers Park- Marginal St at East Boston Shipyard, 8 trips</li><li>The Eddy at New Street, 5 trips</li><li>Glendon St at Condor St, 2 trips</li><li>Airport T Stop - Bremen St at Brooks St, 1 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Glendon St at Condor St<br><ol><li>Airport T Stop - Bremen St at Brooks St, 7 trips</li><li>Glendon St at Condor St, 3 trips</li><li>Orient Heights T Stop - Bennington St at Saratoga St, 2 trips</li><li>Chelsea St at Saratoga St, 1 trips</li><li>Maverick Sq - Lewis Mall, 1 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Orient Heights T Stop - Bennington St at Saratoga St<br><ol><li>Airport T Stop - Bremen St at Brooks St, 7 trips</li><li>Maverick Sq - Lewis Mall, 5 trips</li><li>Bennington St at Byron St, 4 trips</li><li>Orient Heights T Stop - Bennington St at Saratoga St, 2 trips</li><li>Powder House Circle - Nathan Tufts Park, 2 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Central Square East Boston - Porter Street at London Street<br><ol><li>EBNHC - 20 Maverick Sq, 17 trips</li><li>Maverick Sq - Lewis Mall, 2 trips</li><li>Airport T Stop - Bremen St at Brooks St, 1 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Newbury St / Hereford St<br><ol><li>MIT at Mass Ave / Amherst St, 321 trips</li><li>Boylston St. at Arlington St., 221 trips</li><li>South Station - 700 Atlantic Ave., 212 trips</li><li>Charles Circle - Charles St. at Cambridge St., 209 trips</li><li>Boston Public Library - 700 Boylston St., 198 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Ruggles Station / Columbus Ave.<br><ol><li>Jackson Square T at Centre St, 428 trips</li><li>Longwood Ave / Binney St, 424 trips</li><li>Landmark Centre, 385 trips</li><li>Roxbury Crossing Station, 347 trips</li><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 269 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> HMS / HSPH - Ave. Louis Pasteur at Longwood Ave.<br><ol><li>Landmark Centre, 631 trips</li><li>Ruggles Station / Columbus Ave., 392 trips</li><li>Colleges of the Fenway, 311 trips</li><li>Boylston / Mass Ave, 239 trips</li><li>Coolidge Corner - Beacon St @ Centre St, 238 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Aquarium Station - 200 Atlantic Ave.<br><ol><li>South Station - 700 Atlantic Ave., 881 trips</li><li>State Street at Channel Center, 309 trips</li><li>Cross St. at Hanover St., 296 trips</li><li>Lewis Wharf - Atlantic Ave., 290 trips</li><li>Congress / Sleeper, 271 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Christian Science Plaza<br><ol><li>Washington St. at Rutland St., 383 trips</li><li>Boston Medical Center - East Concord at Harrison Ave, 377 trips</li><li>Boston Public Library - 700 Boylston St., 317 trips</li><li>Prudential Center / Belvidere, 298 trips</li><li>MIT at Mass Ave / Amherst St, 280 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Colleges of the Fenway<br><ol><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 280 trips</li><li>Ruggles Station / Columbus Ave., 168 trips</li><li>Longwood Ave / Binney St, 130 trips</li><li>Northeastern U / North Parking Lot, 125 trips</li><li>Prudential Center / Belvidere, 125 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Seaport Square - Seaport Blvd. at Boston Wharf<br><ol><li>Cross St. at Hanover St., 478 trips</li><li>Aquarium Station - 200 Atlantic Ave., 367 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 342 trips</li><li>Mayor Martin J Walsh - 28 State St, 339 trips</li><li>South Station - 700 Atlantic Ave., 284 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Mayor Martin J Walsh - 28 State St<br><ol><li>South Station - 700 Atlantic Ave., 767 trips</li><li>Cambridge St. at Joy St., 427 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 322 trips</li><li>Lewis Wharf - Atlantic Ave., 304 trips</li><li>Stuart St. at Charles St., 258 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Kenmore Sq / Comm Ave<br><ol><li>MIT at Mass Ave / Amherst St, 728 trips</li><li>MIT Stata Center at Vassar St / Main St, 585 trips</li><li>Agganis Arena - 925 Comm Ave., 432 trips</li><li>One Kendall Square at Hampshire St / Portland St, 379 trips</li><li>Packard's Corner - Comm. Ave. at Brighton Ave., 269 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Yawkey Way at Boylston St.<br><ol><li>Boylston / Mass Ave, 397 trips</li><li>Kenmore Sq / Comm Ave, 308 trips</li><li>Longwood Ave / Binney St, 302 trips</li><li>Christian Science Plaza, 258 trips</li><li>MIT at Mass Ave / Amherst St, 234 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Northeastern U / North Parking Lot<br><ol><li>Yawkey Way at Boylston St., 335 trips</li><li>Northeastern U / North Parking Lot, 306 trips</li><li>Brigham Cir / Huntington Ave, 287 trips</li><li>Prudential Center / Belvidere, 187 trips</li><li>Boylston at Fairfield, 177 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Brigham Cir / Huntington Ave<br><ol><li>Northeastern U / North Parking Lot, 377 trips</li><li>Roxbury Crossing Station, 309 trips</li><li>Landmark Centre, 231 trips</li><li>Brookline Village - Station Street @ MBTA, 231 trips</li><li>Wentworth Institute of Technology, 220 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Seaport Hotel<br><ol><li>South Station - 700 Atlantic Ave., 413 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 343 trips</li><li>Rowes Wharf - Atlantic Ave, 283 trips</li><li>Post Office Square, 171 trips</li><li>Mayor Martin J Walsh - 28 State St, 158 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Landmark Centre<br><ol><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 719 trips</li><li>Longwood Ave / Binney St, 651 trips</li><li>Ruggles Station / Columbus Ave., 293 trips</li><li>Brigham Cir / Huntington Ave, 198 trips</li><li>Kenmore Sq / Comm Ave, 191 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Beacon St / Mass Ave<br><ol><li>MIT at Mass Ave / Amherst St, 2862 trips</li><li>MIT Stata Center at Vassar St / Main St, 553 trips</li><li>Beacon St / Mass Ave, 313 trips</li><li>Central Square at Mass Ave / Essex St, 309 trips</li><li>Kenmore Sq / Comm Ave, 278 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Dudley Square<br><ol><li>Roxbury Crossing Station, 109 trips</li><li>South Station - 700 Atlantic Ave., 80 trips</li><li>Brigham Cir / Huntington Ave, 78 trips</li><li>Washington St. at Lenox St., 76 trips</li><li>Egleston Square at Columbus Ave, 56 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boylston / Mass Ave<br><ol><li>Yawkey Way at Boylston St., 518 trips</li><li>MIT at Mass Ave / Amherst St, 448 trips</li><li>Boston Public Library - 700 Boylston St., 321 trips</li><li>Boylston St / Berkeley St, 262 trips</li><li>Back Bay / South End Station, 240 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> BIDMC - Brookline at Burlington St<br><ol><li>Longwood Ave / Binney St, 391 trips</li><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 123 trips</li><li>MIT Stata Center at Vassar St / Main St, 86 trips</li><li>Nashua Street at Red Auerbach Way, 85 trips</li><li>Christian Science Plaza, 73 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Wentworth Institute of Technology<br><ol><li>Brigham Cir / Huntington Ave, 292 trips</li><li>Wentworth Institute of Technology, 272 trips</li><li>Prudential Center / Belvidere, 168 trips</li><li>Northeastern U / North Parking Lot, 138 trips</li><li>Landmark Centre, 129 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Roxbury YMCA<br><ol><li>Ruggles Station / Columbus Ave., 40 trips</li><li>Dudley Square, 23 trips</li><li>MLK Blvd at Washington St, 17 trips</li><li>Christian Science Plaza, 16 trips</li><li>Washington St. at Waltham St., 16 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MLK Blvd at Washington St<br><ol><li>Heath St at South Huntington, 25 trips</li><li>Brigham Cir / Huntington Ave, 23 trips</li><li>Roxbury YMCA, 18 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 9 trips</li><li>Egleston Square at Columbus Ave, 9 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Upham's Corner T Stop<br><ol><li>Brigham Cir / Huntington Ave, 22 trips</li><li>Christian Science Plaza, 14 trips</li><li>JFK / UMASS at MBTA Station, 7 trips</li><li>Boylston / Mass Ave, 6 trips</li><li>E. Cottage St at Columbia Rd, 6 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Washington St at Melnea Cass Blvd<br><ol><li>Back Bay / South End Station, 132 trips</li><li>Prudential Center / Belvidere, 56 trips</li><li>Ruggles Station / Columbus Ave., 36 trips</li><li>Washington St. at Rutland St., 34 trips</li><li>Washington St. at Waltham St., 21 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Walnut Ave at Crawford St<br><ol><li>Brigham Cir / Huntington Ave, 43 trips</li><li>John F Fitzgerald - Surface Road at India Street, 42 trips</li><li>Jackson Square T at Centre St, 30 trips</li><li>Egleston Square at Columbus Ave, 12 trips</li><li>Dudley Square, 6 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Grove Hall Library<br><ol><li>Christian Science Plaza, 55 trips</li><li>Roxbury YMCA, 12 trips</li><li>UMass Boston Integrated Sciences Complex, 10 trips</li><li>Beacon St / Mass Ave, 3 trips</li><li>JFK / UMASS at MBTA Station, 3 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Columbia Rd at Ceylon St<br><ol><li>Landmark Centre, 18 trips</li><li>Upham's Corner - Columbia Rd, 6 trips</li><li>Mass Ave at Newmarket Square, 5 trips</li><li>Boylston St / Washington St, 5 trips</li><li>Columbia Rd at Ceylon St, 4 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Walnut Ave at Warren St<br><ol><li>MIT at Mass Ave / Amherst St, 12 trips</li><li>Walnut Ave at Warren St, 7 trips</li><li>Roxbury YMCA, 6 trips</li><li>ID Building West, 4 trips</li><li>MIT Stata Center at Vassar St / Main St, 4 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Bowdoin St at Quincy St<br><ol><li>Columbia Rd at Ceylon St, 9 trips</li><li>Kenmore Sq / Comm Ave, 6 trips</li><li>Bowdoin St at Quincy St, 6 trips</li><li>Mass Ave at Newmarket Square, 5 trips</li><li>Back Bay / South End Station, 4 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Tremont St. at Berkeley St.<br><ol><li>South Station - 700 Atlantic Ave., 578 trips</li><li>Chinatown Gate Plaza - Surface Rd. at Beach St., 412 trips</li><li>Franklin St. / Arch St., 293 trips</li><li>Mayor Martin J Walsh - 28 State St, 243 trips</li><li>Post Office Square, 223 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Roxbury Crossing Station<br><ol><li>Brigham Cir / Huntington Ave, 430 trips</li><li>Ruggles Station / Columbus Ave., 370 trips</li><li>Jackson Square T at Centre St, 280 trips</li><li>Northeastern U / North Parking Lot, 185 trips</li><li>Longwood Ave / Binney St, 165 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boston Medical Center - East Concord at Harrison Ave<br><ol><li>Back Bay / South End Station, 464 trips</li><li>Christian Science Plaza, 389 trips</li><li>Ink Block, 358 trips</li><li>South Station - 700 Atlantic Ave., 290 trips</li><li>Prudential Center / Belvidere, 230 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Back Bay / South End Station<br><ol><li>Washington St. at Rutland St., 581 trips</li><li>Tremont St / W Newton St, 476 trips</li><li>Boston Medical Center - East Concord at Harrison Ave, 459 trips</li><li>MIT Stata Center at Vassar St / Main St, 456 trips</li><li>South Station - 700 Atlantic Ave., 430 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Columbus Ave. at Mass. Ave.<br><ol><li>Back Bay / South End Station, 66 trips</li><li>Longwood Ave / Binney St, 33 trips</li><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 28 trips</li><li>Boston Medical Center - East Concord at Harrison Ave, 28 trips</li><li>Roxbury Crossing Station, 25 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Washington St. at Lenox St.<br><ol><li>South Station - 700 Atlantic Ave., 150 trips</li><li>Washington St. at Lenox St., 134 trips</li><li>Boylston St / Berkeley St, 134 trips</li><li>Ruggles Station / Columbus Ave., 121 trips</li><li>Christian Science Plaza, 112 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Washington St. at Rutland St.<br><ol><li>Back Bay / South End Station, 705 trips</li><li>South Station - 700 Atlantic Ave., 553 trips</li><li>Prudential Center / Belvidere, 460 trips</li><li>Washington St. at Waltham St., 316 trips</li><li>Christian Science Plaza, 310 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Prudential Center / Belvidere<br><ol><li>Washington St. at Rutland St., 444 trips</li><li>Christian Science Plaza, 401 trips</li><li>South Station - 700 Atlantic Ave., 292 trips</li><li>Washington St. at Waltham St., 253 trips</li><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 249 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boylston at Fairfield<br><ol><li>South Station - 700 Atlantic Ave., 494 trips</li><li>Tremont St / West St, 338 trips</li><li>Boston Public Library - 700 Boylston St., 313 trips</li><li>Charles Circle - Charles St. at Cambridge St., 285 trips</li><li>Nashua Street at Red Auerbach Way, 271 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Dorchester Ave. at Gillette Park<br><ol><li>South Station - 700 Atlantic Ave., 252 trips</li><li>Congress / Sleeper, 168 trips</li><li>Seaport Hotel, 155 trips</li><li>Dorchester Ave. at Gillette Park, 141 trips</li><li>Washington St. at Waltham St., 110 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Congress / Sleeper<br><ol><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 750 trips</li><li>South Station - 700 Atlantic Ave., 646 trips</li><li>Nashua Street at Red Auerbach Way, 377 trips</li><li>TD Garden - Causeway at Portal Park #2, 374 trips</li><li>Cross St. at Hanover St., 373 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Andrew Station - Dorchester Ave at Humboldt Pl<br><ol><li>Congress / Sleeper, 266 trips</li><li>Seaport Hotel, 139 trips</li><li>Boston Medical Center - East Concord at Harrison Ave, 132 trips</li><li>Lawn on D, 126 trips</li><li>Boylston St / Berkeley St, 76 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> JFK / UMASS at MBTA Station<br><ol><li>UMass Boston Integrated Sciences Complex, 307 trips</li><li>JFK / UMASS at MBTA Station, 87 trips</li><li>State Street at Channel Center, 74 trips</li><li>Boston Medical Center - East Concord at Harrison Ave, 61 trips</li><li>Day Boulevard, 48 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> UMass Boston Integrated Sciences Complex<br><ol><li>JFK / UMASS at MBTA Station, 307 trips</li><li>UMass Boston Integrated Sciences Complex, 46 trips</li><li>Day Boulevard, 38 trips</li><li>Savin Hill MBTA Station, 32 trips</li><li>Ryan Playground - Dorchester Avenue Station, 27 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Mt Pleasant Ave / Dudley Town Common<br><ol><li>Boylston / Mass Ave, 63 trips</li><li>Boston Medical Center - East Concord at Harrison Ave, 40 trips</li><li>Christian Science Plaza, 37 trips</li><li>Washington St. at Lenox St., 25 trips</li><li>Colleges of the Fenway, 24 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> West Broadway at Dorchester St<br><ol><li>South Station - 700 Atlantic Ave., 437 trips</li><li>Congress / Sleeper, 259 trips</li><li>State Street at Channel Center, 201 trips</li><li>John F Fitzgerald - Surface Road at India Street, 170 trips</li><li>Dorchester Ave. at Gillette Park, 170 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> South Boston Library - 646 East Broadway<br><ol><li>South Station - 700 Atlantic Ave., 322 trips</li><li>State Street at Channel Center, 194 trips</li><li>Back Bay / South End Station, 186 trips</li><li>Boylston St. at Arlington St., 142 trips</li><li>West Broadway at Dorchester St, 140 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> E. Cottage St at Columbia Rd<br><ol><li>Franklin St. / Arch St., 158 trips</li><li>Kenmore Sq / Comm Ave, 81 trips</li><li>Tremont St. at Berkeley St., 55 trips</li><li>Congress / Sleeper, 44 trips</li><li>Purchase St at Pearl St, 39 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Upham's Corner - Columbia Rd<br><ol><li>West Broadway at D Street, 49 trips</li><li>Washington St. at Waltham St., 27 trips</li><li>Washington St. at Lenox St., 22 trips</li><li>Christian Science Plaza, 19 trips</li><li>Brigham Cir / Huntington Ave, 19 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> ID Building East<br><ol><li>South Station - 700 Atlantic Ave., 462 trips</li><li>Congress St and Northern Ave, 402 trips</li><li>Aquarium Station - 200 Atlantic Ave., 225 trips</li><li>ID Building West, 174 trips</li><li>ID Building East, 169 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> ID Building West<br><ol><li>South Station - 700 Atlantic Ave., 812 trips</li><li>Aquarium Station - 200 Atlantic Ave., 227 trips</li><li>Congress St and Northern Ave, 213 trips</li><li>Seaport Square - Seaport Blvd. at Boston Wharf, 206 trips</li><li>Congress / Sleeper, 183 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Mass Ave at Newmarket Square<br><ol><li>Boston Medical Center - East Concord at Harrison Ave, 82 trips</li><li>Andrew Station - Dorchester Ave at Humboldt Pl, 46 trips</li><li>Christian Science Plaza, 39 trips</li><li>Washington St. at Rutland St., 37 trips</li><li>Ruggles Station / Columbus Ave., 36 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Day Boulevard<br><ol><li>Day Boulevard, 296 trips</li><li>South Station - 700 Atlantic Ave., 163 trips</li><li>West Broadway at D Street, 104 trips</li><li>South Boston Library - 646 East Broadway, 92 trips</li><li>Congress St and Northern Ave, 62 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> State Street at Channel Center<br><ol><li>South Station - 700 Atlantic Ave., 655 trips</li><li>Aquarium Station - 200 Atlantic Ave., 296 trips</li><li>Congress / Sleeper, 234 trips</li><li>West Broadway at D Street, 224 trips</li><li>State Street at Channel Center, 222 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Ink Block<br><ol><li>South Station - 700 Atlantic Ave., 659 trips</li><li>Boston Medical Center - East Concord at Harrison Ave, 496 trips</li><li>Washington St. at Rutland St., 329 trips</li><li>Washington St. at Waltham St., 234 trips</li><li>Back Bay / South End Station, 226 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Franklin Park - Seaver Street at Humbolt Ave<br><ol><li>Franklin Park - Seaver Street at Humbolt Ave, 87 trips</li><li>Jackson Square T at Centre St, 49 trips</li><li>Egleston Square at Columbus Ave, 33 trips</li><li>Ruggles Station / Columbus Ave., 18 trips</li><li>Franklin Park Zoo, 15 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lawn on D<br><ol><li>South Station - 700 Atlantic Ave., 551 trips</li><li>West Broadway at D Street, 221 trips</li><li>Cross St. at Hanover St., 173 trips</li><li>Andrew Station - Dorchester Ave at Humboldt Pl, 148 trips</li><li>West Broadway at Dorchester St, 129 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> West Broadway at D Street<br><ol><li>Congress / Sleeper, 419 trips</li><li>South Station - 700 Atlantic Ave., 343 trips</li><li>Back Bay / South End Station, 300 trips</li><li>State Street at Channel Center, 237 trips</li><li>Lawn on D, 212 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Franklin Park Zoo<br><ol><li>Franklin Park Zoo, 77 trips</li><li>Mt Pleasant Ave / Dudley Town Common, 29 trips</li><li>Franklin Park - Seaver Street at Humbolt Ave, 23 trips</li><li>Egleston Square at Columbus Ave, 18 trips</li><li>Roxbury YMCA, 15 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Ryan Playground - Dorchester Avenue Station<br><ol><li>ID Building West, 74 trips</li><li>South Station - 700 Atlantic Ave., 65 trips</li><li>Lewis Wharf - Atlantic Ave., 58 trips</li><li>Mayor Martin J Walsh - 28 State St, 49 trips</li><li>Ryan Playground - Dorchester Avenue Station, 48 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Congress St and Northern Ave<br><ol><li>ID Building East, 309 trips</li><li>ID Building West, 276 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 151 trips</li><li>South Station - 700 Atlantic Ave., 142 trips</li><li>Seaport Square - Seaport Blvd. at Boston Wharf, 142 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Savin Hill MBTA Station<br><ol><li>Mayor Martin J Walsh - 28 State St, 54 trips</li><li>Yawkey Way at Boylston St., 52 trips</li><li>UMass Boston Integrated Sciences Complex, 34 trips</li><li>Savin Hill MBTA Station, 33 trips</li><li>Chinatown Gate Plaza - Surface Rd. at Beach St., 30 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Watermark Seaport<br><ol><li>Nashua Street at Red Auerbach Way, 125 trips</li><li>Cross St. at Hanover St., 107 trips</li><li>Aquarium Station - 200 Atlantic Ave., 87 trips</li><li>South Station - 700 Atlantic Ave., 84 trips</li><li>Lewis Wharf - Atlantic Ave., 44 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Cambridge St. at Joy St.<br><ol><li>Rowes Wharf - Atlantic Ave, 351 trips</li><li>Charles Circle - Charles St. at Cambridge St., 264 trips</li><li>South Station - 700 Atlantic Ave., 240 trips</li><li>Lechmere Station at Cambridge St / First St, 236 trips</li><li>One Broadway / Kendall Sq at Main St / 3rd St, 236 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> New Balance - 20 Guest St.<br><ol><li>Dana Park, 72 trips</li><li>Packard's Corner - Comm. Ave. at Brighton Ave., 71 trips</li><li>Dorchester Ave. at Gillette Park, 48 trips</li><li>Harvard Real Estate - Brighton Mills - 370 Western Ave, 46 trips</li><li>Harvard University River Houses at DeWolfe St / Cowperthwaite St, 41 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Washington St. at Waltham St.<br><ol><li>Franklin St. / Arch St., 377 trips</li><li>Back Bay / South End Station, 367 trips</li><li>Washington St. at Rutland St., 342 trips</li><li>South Station - 700 Atlantic Ave., 335 trips</li><li>Prudential Center / Belvidere, 289 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> TD Garden - Causeway at Portal Park #2<br><ol><li>South Station - 700 Atlantic Ave., 434 trips</li><li>Spaulding Rehabilitation Hospital - Charlestown Navy Yard, 349 trips</li><li>Congress / Sleeper, 344 trips</li><li>Charlestown - Warren St at Chelsea St, 268 trips</li><li>John F Fitzgerald - Surface Road at India Street, 255 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Franklin St. / Arch St.<br><ol><li>John F Fitzgerald - Surface Road at India Street, 287 trips</li><li>The Esplanade - Beacon St. at Arlington St., 269 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 260 trips</li><li>Charles St at Beacon St, 253 trips</li><li>Washington St. at Waltham St., 242 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boston Public Library - 700 Boylston St.<br><ol><li>South Station - 700 Atlantic Ave., 428 trips</li><li>Boylston St / Washington St, 343 trips</li><li>Christian Science Plaza, 312 trips</li><li>Tremont St / West St, 286 trips</li><li>Charles St at Beacon St, 272 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lewis Wharf - Atlantic Ave.<br><ol><li>South Station - 700 Atlantic Ave., 1403 trips</li><li>Rowes Wharf - Atlantic Ave, 607 trips</li><li>John F Fitzgerald - Surface Road at India Street, 513 trips</li><li>Purchase St at Pearl St, 465 trips</li><li>Aquarium Station - 200 Atlantic Ave., 242 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boylston St. at Arlington St.<br><ol><li>South Station - 700 Atlantic Ave., 815 trips</li><li>Rowes Wharf - Atlantic Ave, 344 trips</li><li>Tremont St / West St, 286 trips</li><li>Charles Circle - Charles St. at Cambridge St., 271 trips</li><li>Newbury St / Hereford St, 261 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Rowes Wharf - Atlantic Ave<br><ol><li>Lewis Wharf - Atlantic Ave., 815 trips</li><li>Cross St. at Hanover St., 702 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 523 trips</li><li>TD Garden - Causeway at Portal Park #2, 370 trips</li><li>Charlestown - Warren St at Chelsea St, 334 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Faneuil Hall - Union St. at North St.<br><ol><li>South Station - 700 Atlantic Ave., 361 trips</li><li>Congress / Sleeper, 190 trips</li><li>Spaulding Rehabilitation Hospital - Charlestown Navy Yard, 189 trips</li><li>Franklin St. / Arch St., 169 trips</li><li>Charlestown - Warren St at Chelsea St, 164 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Cross St. at Hanover St.<br><ol><li>South Station - 700 Atlantic Ave., 750 trips</li><li>Congress / Sleeper, 422 trips</li><li>Rowes Wharf - Atlantic Ave, 405 trips</li><li>Lewis Wharf - Atlantic Ave., 392 trips</li><li>Charlestown - Warren St at Chelsea St, 321 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Stuart St. at Charles St.<br><ol><li>South Station - 700 Atlantic Ave., 355 trips</li><li>Boston Public Library - 700 Boylston St., 188 trips</li><li>Mayor Martin J Walsh - 28 State St, 168 trips</li><li>Yawkey Way at Boylston St., 152 trips</li><li>Chinatown Gate Plaza - Surface Rd. at Beach St., 146 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Post Office Square<br><ol><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 622 trips</li><li>Nashua Street at Red Auerbach Way, 283 trips</li><li>Congress / Sleeper, 273 trips</li><li>Cross St. at Hanover St., 248 trips</li><li>Cambridge St. at Joy St., 211 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boylston St / Berkeley St<br><ol><li>South Station - 700 Atlantic Ave., 755 trips</li><li>Boylston St / Washington St, 261 trips</li><li>Charles Circle - Charles St. at Cambridge St., 191 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 185 trips</li><li>Charles St at Beacon St, 178 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Tremont St / West St<br><ol><li>Boylston St. at Arlington St., 347 trips</li><li>The Esplanade - Beacon St. at Arlington St., 323 trips</li><li>Boston Public Library - 700 Boylston St., 309 trips</li><li>Tremont St. at Berkeley St., 269 trips</li><li>Boylston at Fairfield, 222 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Chinatown Gate Plaza - Surface Rd. at Beach St.<br><ol><li>Tremont St. at Berkeley St., 431 trips</li><li>Ink Block, 387 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 303 trips</li><li>Mayor Martin J Walsh - 28 State St, 268 trips</li><li>Washington St. at Waltham St., 248 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Charles Circle - Charles St. at Cambridge St.<br><ol><li>Boylston St. at Arlington St., 400 trips</li><li>Boylston at Fairfield, 369 trips</li><li>Kendall T, 351 trips</li><li>Boston Public Library - 700 Boylston St., 310 trips</li><li>MIT at Mass Ave / Amherst St, 295 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> The Esplanade - Beacon St. at Arlington St.<br><ol><li>The Esplanade - Beacon St. at Arlington St., 430 trips</li><li>South Station - 700 Atlantic Ave., 411 trips</li><li>MIT at Mass Ave / Amherst St, 268 trips</li><li>Beacon St / Mass Ave, 264 trips</li><li>Charles Circle - Charles St. at Cambridge St., 261 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boston Convention & Exhibition Center<br><ol><li>South Station - 700 Atlantic Ave., 460 trips</li><li>Day Boulevard, 105 trips</li><li>Cross St. at Hanover St., 79 trips</li><li>West Broadway at Dorchester St, 72 trips</li><li>Lawn on D, 56 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Boylston St / Washington St<br><ol><li>South Station - 700 Atlantic Ave., 553 trips</li><li>Boston Public Library - 700 Boylston St., 242 trips</li><li>Mayor Martin J Walsh - 28 State St, 201 trips</li><li>Washington St. at Rutland St., 199 trips</li><li>Boylston at Fairfield, 173 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Charlestown - Main St at Austin St<br><ol><li>Mayor Martin J Walsh - 28 State St, 227 trips</li><li>Charlestown - Warren St at Chelsea St, 195 trips</li><li>Cross St. at Hanover St., 183 trips</li><li>Spaulding Rehabilitation Hospital - Charlestown Navy Yard, 183 trips</li><li>One Broadway / Kendall Sq at Main St / 3rd St, 166 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Charlestown - Warren St at Chelsea St<br><ol><li>Spaulding Rehabilitation Hospital - Charlestown Navy Yard, 398 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 356 trips</li><li>TD Garden - Causeway at Portal Park #2, 305 trips</li><li>South Station - 700 Atlantic Ave., 282 trips</li><li>Cross St. at Hanover St., 249 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1)<br><ol><li>Congress / Sleeper, 823 trips</li><li>South Station - 700 Atlantic Ave., 639 trips</li><li>John F Fitzgerald - Surface Road at India Street, 493 trips</li><li>Spaulding Rehabilitation Hospital - Charlestown Navy Yard, 459 trips</li><li>Post Office Square, 385 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Spaulding Rehabilitation Hospital - Charlestown Navy Yard<br><ol><li>TD Garden - Causeway at Portal Park #2, 432 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 373 trips</li><li>Charlestown - Warren St at Chelsea St, 360 trips</li><li>Faneuil Hall - Union St. at North St., 243 trips</li><li>Lechmere Station at Cambridge St / First St, 214 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Charles St at Beacon St<br><ol><li>Boston Public Library - 700 Boylston St., 263 trips</li><li>Boylston at Fairfield, 251 trips</li><li>Franklin St. / Arch St., 202 trips</li><li>Beacon St / Mass Ave, 182 trips</li><li>Boylston St. at Arlington St., 178 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Hayes Square at Vine St.<br><ol><li>Franklin St. / Arch St., 159 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 118 trips</li><li>Cross St. at Hanover St., 102 trips</li><li>Post Office Square, 101 trips</li><li>TD Garden - Causeway at Portal Park #2, 84 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> New Balance Store - Boylston at Dartmouth<br><ol><li>South Station - 700 Atlantic Ave., 185 trips</li><li>Newbury St / Hereford St, 173 trips</li><li>Chinatown Gate Plaza - Surface Rd. at Beach St., 170 trips</li><li>Rowes Wharf - Atlantic Ave, 140 trips</li><li>Boylston St / Washington St, 124 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Brighton Center<br><ol><li>Union Square - Brighton Ave. at Cambridge St., 115 trips</li><li>B.U. Central - 725 Comm. Ave., 113 trips</li><li>Kenmore Sq / Comm Ave, 100 trips</li><li>Washington Square at Washington St. / Beacon St., 75 trips</li><li>Packard's Corner - Comm. Ave. at Brighton Ave., 70 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Washington St at Brock St<br><ol><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 105 trips</li><li>Central Square at Mass Ave / Essex St, 94 trips</li><li>Union Square - Brighton Ave. at Cambridge St., 66 trips</li><li>Kenmore Sq / Comm Ave, 54 trips</li><li>Brighton Center, 51 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Market St at Faneuil St<br><ol><li>Agganis Arena - 925 Comm Ave., 16 trips</li><li>MIT Stata Center at Vassar St / Main St, 16 trips</li><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 13 trips</li><li>Union Square - Brighton Ave. at Cambridge St., 12 trips</li><li>Kenmore Sq / Comm Ave, 12 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Oak Square YMCA<br><ol><li>Longwood Ave / Binney St, 56 trips</li><li>Harvard Law School at Mass Ave / Jarvis St, 22 trips</li><li>Kenmore Sq / Comm Ave, 14 trips</li><li>Union Square - Brighton Ave. at Cambridge St., 11 trips</li><li>Washington St at Brock St, 9 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Curtis Hall at South Street<br><ol><li>Green St T, 200 trips</li><li>Landmark Centre, 181 trips</li><li>Hyde Square at Barbara St, 176 trips</li><li>Curtis Hall at South Street, 124 trips</li><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 98 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Hyde Square at Barbara St<br><ol><li>Curtis Hall at South Street, 236 trips</li><li>Brigham Cir / Huntington Ave, 193 trips</li><li>Jackson Square T at Centre St, 159 trips</li><li>Mayor Martin J Walsh - 28 State St, 110 trips</li><li>Longwood Ave / Binney St, 93 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Egleston Square at Columbus Ave<br><ol><li>Landmark Centre, 96 trips</li><li>Dudley Square, 80 trips</li><li>Green St T, 65 trips</li><li>Colleges of the Fenway, 49 trips</li><li>Egleston Square at Columbus Ave, 48 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Green St T<br><ol><li>Curtis Hall at South Street, 226 trips</li><li>Jackson Square T at Centre St, 189 trips</li><li>Roxbury Crossing Station, 166 trips</li><li>Yawkey Way at Boylston St., 158 trips</li><li>Ruggles Station / Columbus Ave., 152 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Jackson Square T at Centre St<br><ol><li>Ruggles Station / Columbus Ave., 414 trips</li><li>Roxbury Crossing Station, 388 trips</li><li>Back Bay / South End Station, 176 trips</li><li>Green St T, 164 trips</li><li>Jackson Square T at Centre St, 140 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Heath St at South Huntington<br><ol><li>Northeastern U / North Parking Lot, 172 trips</li><li>Brigham Cir / Huntington Ave, 149 trips</li><li>Buswell St. at Park Dr., 126 trips</li><li>Longwood Ave / Binney St, 119 trips</li><li>Boston Medical Center - East Concord at Harrison Ave, 80 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Coolidge Corner - Beacon St @ Centre St<br><ol><li>Longwood Ave / Binney St, 567 trips</li><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 294 trips</li><li>Buswell St. at Park Dr., 232 trips</li><li>Agganis Arena - 925 Comm Ave., 193 trips</li><li>Washington Square at Washington St. / Beacon St., 183 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Washington Square at Washington St. / Beacon St.<br><ol><li>Coolidge Corner - Beacon St @ Centre St, 251 trips</li><li>Boston Medical Center - East Concord at Harrison Ave, 159 trips</li><li>Kenmore Sq / Comm Ave, 133 trips</li><li>MIT at Mass Ave / Amherst St, 129 trips</li><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 122 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> JFK Crossing at Harvard St. / Thorndike St.<br><ol><li>HMS / HSPH - Ave. Louis Pasteur at Longwood Ave., 318 trips</li><li>Longwood Ave / Binney St, 289 trips</li><li>Coolidge Corner - Beacon St @ Centre St, 127 trips</li><li>Brigham Cir / Huntington Ave, 124 trips</li><li>Northeastern U / North Parking Lot, 86 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Brookline Village - Station Street @ MBTA<br><ol><li>Landmark Centre, 159 trips</li><li>Brigham Cir / Huntington Ave, 137 trips</li><li>Coolidge Corner - Beacon St @ Centre St, 100 trips</li><li>Packard's Corner - Comm. Ave. at Brighton Ave., 97 trips</li><li>Boylston / Mass Ave, 96 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lechmere Station at Cambridge St / First St<br><ol><li>MIT Stata Center at Vassar St / Main St, 607 trips</li><li>Cambridge St - at Columbia St / Webster Ave, 599 trips</li><li>EF - North Point Park, 378 trips</li><li>Kendall T, 324 trips</li><li>Ames St at Main St, 294 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> One Kendall Square at Hampshire St / Portland St<br><ol><li>Inman Square at Vellucci Plaza / Hampshire St, 742 trips</li><li>Porter Square Station, 656 trips</li><li>MIT Stata Center at Vassar St / Main St, 636 trips</li><li>Kendall T, 609 trips</li><li>MIT at Mass Ave / Amherst St, 403 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> One Broadway / Kendall Sq at Main St / 3rd St<br><ol><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 659 trips</li><li>Lechmere Station at Cambridge St / First St, 380 trips</li><li>MIT at Mass Ave / Amherst St, 366 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 286 trips</li><li>MIT Vassar St, 255 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Kendall T<br><ol><li>MIT at Mass Ave / Amherst St, 1382 trips</li><li>MIT Pacific St at Purrington St, 1313 trips</li><li>MIT Vassar St, 1239 trips</li><li>MIT Stata Center at Vassar St / Main St, 737 trips</li><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 660 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT Stata Center at Vassar St / Main St<br><ol><li>MIT Vassar St, 2039 trips</li><li>MIT Pacific St at Purrington St, 1712 trips</li><li>MIT at Mass Ave / Amherst St, 1300 trips</li><li>Central Square at Mass Ave / Essex St, 1193 trips</li><li>University Park, 625 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT at Mass Ave / Amherst St<br><ol><li>MIT Vassar St, 2991 trips</li><li>Beacon St / Mass Ave, 2494 trips</li><li>Central Square at Mass Ave / Essex St, 1645 trips</li><li>MIT Pacific St at Purrington St, 1578 trips</li><li>MIT Stata Center at Vassar St / Main St, 1292 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Cambridge St - at Columbia St / Webster Ave<br><ol><li>Central Square at Mass Ave / Essex St, 735 trips</li><li>MIT Stata Center at Vassar St / Main St, 542 trips</li><li>MIT at Mass Ave / Amherst St, 497 trips</li><li>Lechmere Station at Cambridge St / First St, 451 trips</li><li>Ames St at Main St, 436 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lafayette Square at Mass Ave / Main St / Columbia St<br><ol><li>MIT at Mass Ave / Amherst St, 958 trips</li><li>MIT Pacific St at Purrington St, 466 trips</li><li>MIT Stata Center at Vassar St / Main St, 436 trips</li><li>MIT Vassar St, 423 trips</li><li>Kendall T, 373 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Inman Square at Vellucci Plaza / Hampshire St<br><ol><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 986 trips</li><li>MIT Stata Center at Vassar St / Main St, 968 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 541 trips</li><li>Central Square at Mass Ave / Essex St, 537 trips</li><li>Kendall T, 493 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Central Square at Mass Ave / Essex St<br><ol><li>MIT at Mass Ave / Amherst St, 1308 trips</li><li>MIT Pacific St at Purrington St, 1301 trips</li><li>MIT Stata Center at Vassar St / Main St, 1043 trips</li><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 1026 trips</li><li>MIT Vassar St, 940 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St<br><ol><li>MIT at Mass Ave / Amherst St, 646 trips</li><li>MIT Stata Center at Vassar St / Main St, 639 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 600 trips</li><li>Harvard Square at Mass Ave/ Dunster, 585 trips</li><li>Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St, 333 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Cambridge Main Library at Broadway / Trowbridge St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 674 trips</li><li>MIT Stata Center at Vassar St / Main St, 505 trips</li><li>Central Square at Mass Ave / Essex St, 429 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 398 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 318 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University Housing - 115 Putnam Ave at Peabody Terrace<br><ol><li>Harvard Square at Mass Ave/ Dunster, 887 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 842 trips</li><li>Central Square at Mass Ave / Essex St, 715 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 575 trips</li><li>Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St, 468 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Kennedy School at Bennett St / Eliot St<br><ol><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 607 trips</li><li>Harvard University Transportation Services - 175 North Harvard St, 539 trips</li><li>Harvard University Housing - 111 Western Ave. at Soldiers Field Park , 412 trips</li><li>Harvard Law School at Mass Ave / Jarvis St, 317 trips</li><li>Harvard Real Estate - Brighton Mills - 370 Western Ave, 313 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Square at Brattle St / Eliot St<br><ol><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 598 trips</li><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 405 trips</li><li>Harvard Law School at Mass Ave / Jarvis St, 388 trips</li><li>Harvard University Transportation Services - 175 North Harvard St, 352 trips</li><li>Mt Auburn, 274 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Square at Mass Ave/ Dunster<br><ol><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 928 trips</li><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 907 trips</li><li>MIT at Mass Ave / Amherst St, 617 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 598 trips</li><li>Harvard University River Houses at DeWolfe St / Cowperthwaite St, 553 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> CambridgeSide Galleria - CambridgeSide PL at Land Blvd<br><ol><li>Kendall T, 526 trips</li><li>One Broadway / Kendall Sq at Main St / 3rd St, 495 trips</li><li>MIT Stata Center at Vassar St / Main St, 305 trips</li><li>Nashua Street at Red Auerbach Way, 257 trips</li><li>Kendall Street, 231 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard Law School at Mass Ave / Jarvis St<br><ol><li>Harvard Square at Brattle St / Eliot St, 556 trips</li><li>Harvard Square at Mass Ave/ Dunster, 434 trips</li><li>Porter Square Station, 391 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 313 trips</li><li>Lesley University, 294 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University Gund Hall at Quincy St / Kirkland S<br><ol><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 647 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 445 trips</li><li>Beacon St at Washington / Kirkland, 436 trips</li><li>Harvard Square at Mass Ave/ Dunster, 345 trips</li><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 307 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lower Cambridgeport at Magazine St/Riverside Rd<br><ol><li>MIT Vassar St, 795 trips</li><li>MIT at Mass Ave / Amherst St, 582 trips</li><li>MIT Stata Center at Vassar St / Main St, 535 trips</li><li>Central Square at Mass Ave / Essex St, 519 trips</li><li>Harvard University River Houses at DeWolfe St / Cowperthwaite St, 480 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 425 trips</li><li>Harvard Square at Brattle St / Eliot St, 401 trips</li><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 370 trips</li><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 363 trips</li><li>Porter Square Station, 338 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University Radcliffe Quadrangle at Shepard St / Garden St<br><ol><li>Harvard Square at Mass Ave/ Dunster, 804 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 658 trips</li><li>Harvard Square at Brattle St / Eliot St, 622 trips</li><li>Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St, 340 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 255 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Linear Park - Mass. Ave. at Cameron Ave. <br><ol><li>Davis Square, 2445 trips</li><li>Alewife Station at Russell Field, 286 trips</li><li>Porter Square Station, 196 trips</li><li>Linear Park - Mass. Ave. at Cameron Ave. , 183 trips</li><li>Harvard Square at Mass Ave/ Dunster, 143 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> 359 Broadway - Broadway at Fayette Street<br><ol><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 875 trips</li><li>MIT Stata Center at Vassar St / Main St, 532 trips</li><li>Cambridge Main Library at Broadway / Trowbridge St, 426 trips</li><li>Ames St at Main St, 323 trips</li><li>Central Square at Mass Ave / Essex St, 322 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Binney St / Sixth St<br><ol><li>MIT Stata Center at Vassar St / Main St, 410 trips</li><li>Nashua Street at Red Auerbach Way, 343 trips</li><li>Lechmere Station at Cambridge St / First St, 282 trips</li><li>Porter Square Station, 235 trips</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 196 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Porter Square Station<br><ol><li>Conway Park - Somerville Avenue, 663 trips</li><li>One Kendall Square at Hampshire St / Portland St, 632 trips</li><li>Binney St / Sixth St, 416 trips</li><li>Harvard Square at Brattle St / Eliot St, 361 trips</li><li>Danehy Park, 360 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Dana Park<br><ol><li>Central Square at Mass Ave / Essex St, 514 trips</li><li>MIT Stata Center at Vassar St / Main St, 362 trips</li><li>MIT at Mass Ave / Amherst St, 353 trips</li><li>Lower Cambridgeport at Magazine St/Riverside Rd, 316 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 308 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Danehy Park<br><ol><li>Porter Square Station, 353 trips</li><li>Harvard University Radcliffe Quadrangle at Shepard St / Garden St, 237 trips</li><li>Harvard Square at Brattle St / Eliot St, 183 trips</li><li>Danehy Park, 135 trips</li><li>Harvard Square at Mass Ave/ Dunster, 132 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Kendall Street<br><ol><li>CambridgeSide Galleria - CambridgeSide PL at Land Blvd, 334 trips</li><li>Lechmere Station at Cambridge St / First St, 249 trips</li><li>MIT Stata Center at Vassar St / Main St, 168 trips</li><li>Nashua Street at Red Auerbach Way, 157 trips</li><li>Cambridge St. at Joy St., 146 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Alewife Station at Russell Field<br><ol><li>Alewife Station at Russell Field, 396 trips</li><li>Davis Square, 356 trips</li><li>Linear Park - Mass. Ave. at Cameron Ave. , 209 trips</li><li>Harvard Square at Brattle St / Eliot St, 125 trips</li><li>Porter Square Station, 86 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> EF - North Point Park<br><ol><li>Lechmere Station at Cambridge St / First St, 435 trips</li><li>Spaulding Rehabilitation Hospital - Charlestown Navy Yard, 208 trips</li><li>EF - North Point Park, 174 trips</li><li>TD Garden - Causeway at Portal Park #2, 165 trips</li><li>Charlestown - Warren St at Chelsea St, 159 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Rindge Avenue - O'Neill Library<br><ol><li>Porter Square Station, 244 trips</li><li>Davis Square, 203 trips</li><li>Harvard Square at Brattle St / Eliot St, 98 trips</li><li>One Kendall Square at Hampshire St / Portland St, 78 trips</li><li>Harvard Square at Mass Ave/ Dunster, 71 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Ames St at Main St<br><ol><li>MIT Vassar St, 1210 trips</li><li>MIT Pacific St at Purrington St, 798 trips</li><li>MIT at Mass Ave / Amherst St, 742 trips</li><li>Central Square at Mass Ave / Essex St, 565 trips</li><li>University Park, 412 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Harvard University River Houses at DeWolfe St / Cowperthwaite St<br><ol><li>Harvard Kennedy School at Bennett St / Eliot St, 537 trips</li><li>Harvard Square at Mass Ave/ Dunster, 493 trips</li><li>Lower Cambridgeport at Magazine St/Riverside Rd, 385 trips</li><li>Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St, 326 trips</li><li>Harvard University River Houses at DeWolfe St / Cowperthwaite St, 314 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Lesley University<br><ol><li>Harvard Square at Brattle St / Eliot St, 193 trips</li><li>Davis Square, 164 trips</li><li>Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St, 131 trips</li><li>Harvard Square at Mass Ave/ Dunster, 115 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 115 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> University Park<br><ol><li>MIT Vassar St, 854 trips</li><li>MIT at Mass Ave / Amherst St, 633 trips</li><li>MIT Pacific St at Purrington St, 615 trips</li><li>Central Square at Mass Ave / Essex St, 574 trips</li><li>MIT Stata Center at Vassar St / Main St, 562 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT Pacific St at Purrington St<br><ol><li>MIT Stata Center at Vassar St / Main St, 2446 trips</li><li>MIT at Mass Ave / Amherst St, 1863 trips</li><li>Kendall T, 1409 trips</li><li>Central Square at Mass Ave / Essex St, 1211 trips</li><li>MIT Vassar St, 1070 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> MIT Vassar St<br><ol><li>MIT Stata Center at Vassar St / Main St, 3582 trips</li><li>MIT at Mass Ave / Amherst St, 2528 trips</li><li>Ames St at Main St, 1661 trips</li><li>Kendall T, 1621 trips</li><li>Central Square at Mass Ave / Essex St, 856 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Mt Auburn<br><ol><li>Harvard Square at Brattle St / Eliot St, 235 trips</li><li>Porter Square Station, 180 trips</li><li>Harvard Kennedy School at Bennett St / Eliot St, 133 trips</li><li>Harvard Square at Mass Ave/ Dunster, 106 trips</li><li>MIT at Mass Ave / Amherst St, 80 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Alewife MBTA at Steel Place<br><ol><li>Davis Square, 44 trips</li><li>Alewife MBTA at Steel Place, 38 trips</li><li>Harvard Square at Brattle St / Eliot St, 22 trips</li><li>Linear Park - Mass. Ave. at Cameron Ave. , 16 trips</li><li>Harvard University River Houses at DeWolfe St / Cowperthwaite St, 14 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Sidney Research Campus/ Erie Street at Waverly<br><ol><li>Central Square at Mass Ave / Essex St, 93 trips</li><li>Kendall T, 76 trips</li><li>University Park, 51 trips</li><li>MIT Stata Center at Vassar St / Main St, 47 trips</li><li>Ames St at Main St, 39 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Third at Binney<br><ol><li>MIT at Mass Ave / Amherst St, 39 trips</li><li>Kendall T, 36 trips</li><li>MIT Stata Center at Vassar St / Main St, 33 trips</li><li>MIT Pacific St at Purrington St, 25 trips</li><li>Lechmere Station at Cambridge St / First St, 19 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Brian P. Murphy Staircase at Child Street<br><ol><li>Kendall T, 87 trips</li><li>Binney St / Sixth St, 60 trips</li><li>Post Office Square, 57 trips</li><li>One Broadway / Kendall Sq at Main St / 3rd St, 57 trips</li><li>MIT Stata Center at Vassar St / Main St, 40 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Somerville City Hall<br><ol><li>MIT Stata Center at Vassar St / Main St, 121 trips</li><li>Davis Square, 113 trips</li><li>Lechmere Station at Cambridge St / First St, 112 trips</li><li>Conway Park - Somerville Avenue, 72 trips</li><li>Porter Square Station, 70 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Union Square - Somerville<br><ol><li>Lechmere Station at Cambridge St / First St, 233 trips</li><li>Central Square at Mass Ave / Essex St, 194 trips</li><li>MIT Stata Center at Vassar St / Main St, 170 trips</li><li>Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St, 137 trips</li><li>Cambridge St - at Columbia St / Webster Ave, 130 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Beacon St at Washington / Kirkland<br><ol><li>Harvard Square at Mass Ave/ Dunster, 448 trips</li><li>MIT Stata Center at Vassar St / Main St, 354 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 347 trips</li><li>Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St, 301 trips</li><li>Central Square at Mass Ave / Essex St, 271 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Conway Park - Somerville Avenue<br><ol><li>MIT Stata Center at Vassar St / Main St, 533 trips</li><li>Porter Square Station, 404 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 234 trips</li><li>Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St, 232 trips</li><li>Harvard Law School at Mass Ave / Jarvis St, 222 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Wilson Square<br><ol><li>Porter Square Station, 425 trips</li><li>Harvard Square at Mass Ave/ Dunster, 218 trips</li><li>Harvard Square at Brattle St / Eliot St, 211 trips</li><li>Davis Square, 166 trips</li><li>Harvard University Gund Hall at Quincy St / Kirkland S, 128 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Davis Square<br><ol><li>Linear Park - Mass. Ave. at Cameron Ave. , 2344 trips</li><li>Teele Square at 239 Holland St, 1115 trips</li><li>Packard Ave / Powderhouse Blvd, 672 trips</li><li>Magoun Square at Trum Field, 384 trips</li><li>Powder House Circle - Nathan Tufts Park, 363 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Powder House Circle - Nathan Tufts Park<br><ol><li>Davis Square, 503 trips</li><li>Porter Square Station, 120 trips</li><li>Magoun Square at Trum Field, 84 trips</li><li>Conway Park - Somerville Avenue, 64 trips</li><li>Powder House Circle - Nathan Tufts Park, 61 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Packard Ave / Powderhouse Blvd<br><ol><li>Davis Square, 639 trips</li><li>Conway Park - Somerville Avenue, 120 trips</li><li>Porter Square Station, 67 trips</li><li>MIT Stata Center at Vassar St / Main St, 59 trips</li><li>Powder House Circle - Nathan Tufts Park, 45 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Somerville Hospital at Highland Ave / Crocker St<br><ol><li>Porter Square Station, 197 trips</li><li>Davis Square, 182 trips</li><li>Christian Science Plaza, 78 trips</li><li>MIT Stata Center at Vassar St / Main St, 76 trips</li><li>Inman Square at Vellucci Plaza / Hampshire St, 37 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Teele Square at 239 Holland St<br><ol><li>Davis Square, 2102 trips</li><li>Porter Square Station, 115 trips</li><li>Teele Square at 239 Holland St, 66 trips</li><li>One Kendall Square at Hampshire St / Portland St, 63 trips</li><li>Linear Park - Mass. Ave. at Cameron Ave. , 61 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Magoun Square at Trum Field<br><ol><li>Davis Square, 331 trips</li><li>Porter Square Station, 132 trips</li><li>Harvard University / SEAS Cruft-Pierce Halls at 29 Oxford St, 87 trips</li><li>One Kendall Square at Hampshire St / Portland St, 80 trips</li><li>Wilson Square, 69 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Broadway St at Mt Pleasant St<br><ol><li>Spaulding Rehabilitation Hospital - Charlestown Navy Yard, 119 trips</li><li>Union Square - Somerville, 106 trips</li><li>MIT at Mass Ave / Amherst St, 68 trips</li><li>Broadway St at Mt Pleasant St, 64 trips</li><li>Magoun Square at Trum Field, 44 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> Upham's Corner - Ramsey St at Dudley St<br><ol><li>State Street at Channel Center, 29 trips</li><li>Washington St. at Waltham St., 19 trips</li><li>Washington St. at Lenox St., 16 trips</li><li>Andrew Station - Dorchester Ave at Humboldt Pl, 12 trips</li><li>Dudley Square, 10 trips</li></ol></div><div class=\"results_group\"><strong>From:</strong> 18 Dorrance Warehouse<br><ol><li>18 Dorrance Warehouse, 12 trips</li><li>Central Sq Post Office / Cambridge City Hall at Mass Ave / Pleasant St, 7 trips</li><li>Conway Park - Somerville Avenue, 5 trips</li><li>Harvard University Transportation Services - 175 North Harvard St, 4 trips</li><li>Charlestown - Main St at Austin St, 4 trips</li></ol></div>"},"illustration_stops0startYear2016startMonthstartWeekdaystartHour6789stationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199membergender":{"trips":{"1":7.8,"2":0.5,"3":5.9,"4":5.5,"5":14,"6":0.8,"7":2.8,"8":2.5,"9":2,"10":32.6,"11":4.4,"12":1.9,"13":11.6,"14":0.5,"15":2.8,"16":0.4,"17":0.8,"18":3.4,"19":8.8,"22":0,"23":0.1,"24":0,"25":0.1,"26":0,"27":0,"28":0,"30":3,"31":4.1,"32":12.5,"33":4.6,"34":4.7,"35":4.4,"36":9.6,"37":14.9,"38":6.6,"39":5.1,"40":3.1,"41":5.2,"42":6.8,"43":6.2,"44":2.9,"45":1,"46":4.7,"47":1.7,"48":2,"49":0.1,"50":0,"51":0,"52":0.2,"53":0,"54":0.2,"55":0,"56":0,"57":0,"58":2.7,"59":1.8,"60":9.1,"61":14.9,"62":0.3,"63":1.5,"64":5.5,"65":10.2,"66":8.4,"67":1.7,"68":16,"69":0.7,"70":0.4,"71":1.2,"72":0.2,"73":0.5,"74":0.7,"75":0.1,"76":0.1,"77":6.6,"78":7.5,"79":0.4,"80":0.7,"81":6.5,"82":1.8,"83":0.1,"84":3.1,"85":0.7,"86":0.2,"87":0.1,"88":2.5,"89":0.1,"90":2.3,"91":7.6,"92":1.2,"93":3.8,"94":3,"95":14.8,"96":11.3,"97":8.1,"98":11.8,"99":10,"100":5.4,"101":4.6,"102":5.9,"103":13.8,"104":9.3,"105":7,"106":8.4,"107":8.7,"108":5.7,"109":3,"110":6.4,"111":1.3,"112":4.2,"113":4,"114":5.8,"115":3,"116":0.6,"117":5.4,"118":0.5,"119":0.2,"120":0,"121":0,"122":0.4,"124":0.7,"125":0.3,"126":1,"127":0.8,"128":0.5,"129":1.4,"130":0.4,"131":0.5,"132":1.4,"133":11.9,"134":15,"135":11.1,"136":18.1,"137":36.7,"138":22.7,"139":3.4,"140":4.1,"141":3.4,"142":9.6,"143":7.7,"144":3.4,"145":2.4,"146":9,"147":8.7,"148":12.6,"149":9.3,"150":4.3,"151":7.9,"152":3.1,"153":8.9,"154":2.1,"155":1,"156":2.2,"157":9.8,"158":4.9,"159":0.6,"160":1.6,"161":8.3,"162":3.1,"163":6.1,"164":0.5,"165":15.9,"166":3.4,"167":0.9,"168":7.5,"169":7.1,"170":7.7,"171":1.8,"172":0.4,"173":0.6,"174":0.4,"175":0.4,"176":0.4,"177":1.4,"178":1.5,"179":1.5,"180":0.3,"181":12.7,"182":0.7,"183":0.6,"184":0.1,"185":0.2,"186":0.1,"187":0.3,"191":0,"199":0.4},"description":"<div class=\"results_title\">Number of trips ending at each station</div><div class=\"results_group\">Stations with the most trips:<br><ol><li>MIT Stata Center at Vassar St / Main St, 36.7 stops/day</li><li>South Station - 700 Atlantic Ave., 32.6 stops/day</li><li>MIT at Mass Ave / Amherst St, 22.7 stops/day</li><li>Kendall T, 18.1 stops/day</li><li>Congress / Sleeper, 16 stops/day</li></ol></div><div class=\"results_group\">Stations with the fewest trips:<br><ol><li>Piers Park- Marginal St at East Boston Shipyard, 0 stops/day</li><li>EBNHC - 20 Maverick Sq, 0 stops/day</li><li>The Eddy at New Street, 0 stops/day</li><li>Glendon St at Condor St, 0 stops/day</li><li>Orient Heights T Stop - Bennington St at Saratoga St, 0 stops/day</li></ol></div>"},"illustration_stops0startYear2016startMonthstartWeekdaystartHour17181920stationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199membergender":{"trips":{"1":1.8,"2":5.6,"3":9.8,"4":8.3,"5":3.5,"6":3.1,"7":6.6,"8":9.5,"9":9.5,"10":23.6,"11":2,"12":10.8,"13":3.8,"14":5.5,"15":6.1,"16":4.2,"17":3.1,"18":11.4,"19":1.9,"20":0,"21":0,"22":0.1,"23":0.1,"24":0.1,"25":0.1,"26":0,"27":0,"28":0.1,"29":0,"30":9.5,"31":7,"32":2.8,"33":10.1,"34":14.9,"35":3,"36":4.3,"37":9.5,"38":11.6,"39":10.2,"40":6.5,"41":4.5,"42":2,"43":8.7,"44":17.3,"45":1.6,"46":11.3,"47":3.9,"48":3.7,"49":0.3,"50":0.4,"51":0.2,"52":0.7,"53":0.2,"54":0,"55":0,"56":0.1,"57":0.1,"58":10.3,"59":4.5,"60":5.2,"61":10.9,"62":0.7,"63":3.1,"64":11.2,"65":10.2,"66":11.2,"67":4.2,"68":4.5,"69":3.3,"70":2.3,"71":0.5,"72":0.4,"73":6.4,"74":5.9,"75":1.3,"76":0.5,"77":0.3,"78":0.9,"79":1.1,"80":3.4,"81":3.2,"82":8.7,"83":0.3,"84":4.9,"85":7.4,"86":0.3,"87":1.7,"88":3.9,"89":0.7,"90":0.7,"91":11,"92":0.8,"93":8.9,"94":10.7,"95":4.2,"96":12.5,"97":10.3,"98":10.5,"99":9.5,"100":5.8,"101":13.6,"102":6.4,"103":2.3,"104":5.5,"105":9,"106":6.2,"107":14.1,"108":12.8,"109":1.5,"110":8.7,"111":5.4,"112":11.5,"113":18.4,"114":4.6,"115":7.9,"116":3.4,"117":4,"118":1.9,"119":1.2,"120":0.3,"121":0.3,"122":2.8,"124":3.4,"125":1,"126":4.1,"127":4.5,"128":1.3,"129":8,"130":3.9,"131":4.6,"132":3.8,"133":9.9,"134":9.4,"135":5.2,"136":9.1,"137":7.9,"138":23.8,"139":14.1,"140":10.1,"141":16.9,"142":27.1,"143":14,"144":9.3,"145":11.4,"146":4.8,"147":8.3,"148":19.4,"149":6.7,"150":6.4,"151":6.1,"152":14.4,"153":4,"154":7,"155":7.6,"156":9.5,"157":3.7,"158":9.1,"159":8,"160":3,"161":3,"162":2.8,"163":4.8,"164":2.1,"165":7.5,"166":9,"167":5,"168":9.7,"169":12.9,"170":15.7,"171":2,"172":0.4,"173":0.5,"174":0.3,"175":1.1,"176":2,"177":6.7,"178":8.4,"179":7.3,"180":4.5,"181":10,"182":2.8,"183":1.9,"184":1.4,"185":2.9,"186":2.5,"187":1.6,"191":0.2,"199":0.1},"description":"<div class=\"results_title\">Number of trips ending at each station</div><div class=\"results_group\">Stations with the most trips:<br><ol><li>Central Square at Mass Ave / Essex St, 27.1 stops/day</li><li>MIT at Mass Ave / Amherst St, 23.8 stops/day</li><li>South Station - 700 Atlantic Ave., 23.6 stops/day</li><li>Harvard Square at Mass Ave/ Dunster, 19.4 stops/day</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 18.4 stops/day</li></ol></div><div class=\"results_group\">Stations with the fewest trips:<br><ol><li>Chelsea St at Saratoga St, 0 stops/day</li><li>Bennington St at Byron St, 0 stops/day</li><li>The Eddy at New Street, 0 stops/day</li><li>Glendon St at Condor St, 0 stops/day</li><li>Central Square East Boston - Porter Street at London Street, 0 stops/day</li></ol></div>"},"illustration_starts0startYear2016startMonthstartWeekdaystartHourstationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199membergender2":{"trips":{"1":9.9,"2":6.8,"3":16.8,"4":15.6,"5":16.1,"6":5.1,"7":11,"8":14.5,"9":16.6,"10":67.8,"11":6.8,"12":15,"13":15.5,"14":8.7,"15":11.5,"16":5.6,"17":4.6,"18":18.4,"19":10.4,"20":0,"21":0.1,"22":0.1,"23":0.2,"24":0.2,"25":0.2,"26":0.1,"27":0,"28":0,"29":0.1,"30":13.2,"31":13.6,"32":16.6,"33":18,"34":21.5,"35":7.6,"36":14.4,"37":27.2,"38":22.4,"39":16.6,"40":13.7,"41":13,"42":10.7,"43":17.9,"44":26.7,"45":2.8,"46":19.5,"47":6.8,"48":7.7,"49":0.6,"50":0.5,"51":0.3,"52":1.1,"53":0.5,"54":0,"55":0.1,"56":0.1,"57":0.1,"58":16.8,"59":9.9,"60":15.6,"61":30.7,"62":1.4,"63":5.8,"64":19.2,"65":20.8,"66":21.5,"67":6.3,"68":20.1,"69":4.3,"70":2.4,"71":1.6,"72":1.1,"73":8.8,"74":6.2,"75":2.1,"76":1.1,"77":8.3,"78":8.8,"79":2,"80":3.2,"81":10.9,"82":12.2,"83":0.5,"84":6.7,"85":10,"86":0.5,"87":2.1,"88":7.9,"89":0.8,"90":3.2,"91":21.5,"92":1.9,"93":17.8,"94":16.8,"95":19.8,"96":24.7,"97":19.5,"98":19.1,"99":23.2,"100":11.7,"101":21.8,"102":12.3,"103":17,"104":15.6,"105":17.8,"106":15.5,"107":24.5,"108":17.1,"109":3.7,"110":17.6,"111":9.5,"112":15,"113":25.9,"114":9.9,"115":10.9,"116":4,"117":10.5,"118":3.7,"119":1.9,"120":0.3,"121":0.4,"122":3.4,"124":5.3,"125":1.4,"126":4.8,"127":6,"128":3.2,"129":12,"130":5.4,"131":5.9,"132":6.2,"133":23.2,"134":29.7,"135":20.3,"136":36.8,"137":46.7,"138":68.3,"139":21.6,"140":21.3,"141":24.4,"142":46,"143":25.6,"144":18.4,"145":18.9,"146":14.5,"147":18.1,"148":34.9,"149":16.6,"150":14.5,"151":15.9,"152":22.6,"153":18.7,"154":10.5,"155":9.4,"156":17,"157":16.1,"158":19,"159":12.5,"160":4.4,"161":11.7,"162":6.2,"163":10.8,"164":3.2,"165":28.2,"166":14.4,"167":5.7,"168":24,"169":35.9,"170":39.6,"171":3.4,"172":0.6,"173":1.6,"174":1.2,"175":2.2,"176":3.9,"177":9.4,"178":12.6,"179":10.2,"180":6.3,"181":18.9,"182":4.1,"183":3.1,"184":3,"185":6.7,"186":3.4,"187":2.5,"191":0.4,"199":0.1},"description":"<div class=\"results_title\">Average trips/day started from each station</div><div class=\"results_group\">Stations with the most trips:<br><ol><li>MIT at Mass Ave / Amherst St, 68.3 starts/day</li><li>South Station - 700 Atlantic Ave., 67.8 starts/day</li><li>MIT Stata Center at Vassar St / Main St, 46.7 starts/day</li><li>Central Square at Mass Ave / Essex St, 46 starts/day</li><li>MIT Vassar St, 39.6 starts/day</li></ol></div><div class=\"results_group\">Stations with the fewest trips:<br><ol><li>Chelsea St at Saratoga St, 0 starts/day</li><li>Glendon St at Condor St, 0 starts/day</li><li>Orient Heights T Stop - Bennington St at Saratoga St, 0 starts/day</li><li>Grove Hall Library, 0 starts/day</li><li>Bennington St at Byron St, 0.1 starts/day</li></ol></div>"},"illustration_starts0startYear2016startMonthstartWeekdaystartHourstationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199membergender1":{"trips":{"1":1.3,"2":2.9,"3":6.8,"4":5.7,"5":7,"6":1.7,"7":4.9,"8":4.4,"9":5.5,"10":14.4,"11":2.7,"12":6.3,"13":2.5,"14":4.2,"15":3.6,"16":2.4,"17":1.2,"18":4,"19":2.7,"20":0,"22":0,"23":0.1,"24":0,"25":0.1,"26":0,"27":0,"28":0,"30":6.5,"31":6.5,"32":7.1,"33":4,"34":9,"35":3.9,"36":3,"37":6.3,"38":8.2,"39":5.5,"40":4.2,"41":4.1,"42":1.7,"43":5.4,"44":10.4,"45":1.3,"46":7.9,"47":1.6,"48":2.9,"49":0.2,"50":0.1,"51":0.1,"52":0.7,"53":0,"54":0.3,"55":0,"56":0,"57":0.1,"58":4.4,"59":3.4,"60":6.2,"61":8.5,"62":0.7,"63":2.1,"64":6,"65":5.8,"66":6.7,"67":1.9,"68":3.9,"69":1.6,"70":0.8,"71":0.7,"72":0.3,"73":2.7,"74":2.6,"75":0.6,"76":0.1,"77":1.4,"78":2.3,"79":0.5,"80":1.4,"81":2.9,"82":4.7,"83":0.3,"84":1.8,"85":2.8,"86":0.4,"87":0.7,"88":2,"89":0.5,"90":0.5,"91":7.5,"92":1.1,"93":3.5,"94":5,"95":4.5,"96":9.2,"97":5.7,"98":7,"99":3.3,"100":2.8,"101":7.1,"102":3.7,"103":3.6,"104":4.9,"105":5.1,"106":4.4,"107":10.3,"108":7.1,"109":0.9,"110":4.8,"111":3.3,"112":7.3,"113":6.5,"114":4.2,"115":4.1,"116":1.9,"117":3.1,"118":1.2,"119":0.3,"120":0.1,"121":0.1,"122":1.7,"124":1.6,"125":1.2,"126":2.8,"127":3.2,"128":1.4,"129":3.9,"130":1.8,"131":2,"132":1.7,"133":6.5,"134":9.5,"135":6,"136":9.6,"137":9.8,"138":16.9,"139":9,"140":6.4,"141":10.9,"142":17.3,"143":10.4,"144":7.9,"145":9.3,"146":5.3,"147":7.7,"148":11.6,"149":6.3,"150":5.4,"151":7.4,"152":8.6,"153":4.9,"154":6.9,"155":5.3,"156":9.5,"157":3.7,"158":8.9,"159":4.3,"160":2.9,"161":5.1,"162":2,"163":4.2,"164":1.8,"165":8.2,"166":6.7,"167":2.7,"168":6.3,"169":7.9,"170":8.3,"171":2.2,"172":0.2,"173":0.6,"174":0.3,"175":0.5,"176":1.5,"177":4.5,"178":4.7,"179":5.1,"180":3,"181":7.9,"182":1.5,"183":1.4,"184":0.7,"185":2,"186":0.8,"187":0.5,"191":0.1,"199":0.1},"description":"<div class=\"results_title\">Average trips/day started from each station</div><div class=\"results_group\">Stations with the most trips:<br><ol><li>Central Square at Mass Ave / Essex St, 17.3 starts/day</li><li>MIT at Mass Ave / Amherst St, 16.9 starts/day</li><li>South Station - 700 Atlantic Ave., 14.4 starts/day</li><li>Harvard Square at Mass Ave/ Dunster, 11.6 starts/day</li><li>Inman Square at Vellucci Plaza / Hampshire St, 10.9 starts/day</li></ol></div><div class=\"results_group\">Stations with the fewest trips:<br><ol><li>Chelsea St at Saratoga St, 0 starts/day</li><li>Piers Park- Marginal St at East Boston Shipyard, 0 starts/day</li><li>EBNHC - 20 Maverick Sq, 0 starts/day</li><li>The Eddy at New Street, 0 starts/day</li><li>Glendon St at Condor St, 0 starts/day</li></ol></div>"},"illustration_starts0startYear2016startMonthstartWeekdaystartHour6789stationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199membergender2":{"trips":{"1":0.6,"2":2.5,"3":3.9,"4":1.2,"5":1.4,"6":1.9,"7":2.7,"8":4.8,"9":7.6,"10":23.4,"11":0.6,"12":4.5,"13":3.9,"14":3.9,"15":3.1,"16":4,"17":2.5,"18":12.8,"19":1.2,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"29":0,"30":3,"31":4.9,"32":0.8,"33":7.2,"34":4.9,"35":1.3,"36":1.5,"37":5.8,"38":5.4,"39":3.5,"40":2.7,"41":3.1,"42":1.4,"43":3.1,"44":5.5,"45":0.7,"46":4.5,"47":1.9,"48":1.2,"49":0.2,"50":0.2,"51":0.1,"52":0.3,"53":0.2,"54":0,"55":0.1,"56":0.1,"57":0,"58":7.3,"59":4.1,"60":3.9,"61":10.5,"62":0.5,"63":2.1,"64":8.8,"65":4.3,"66":4.2,"67":2.8,"68":2.2,"69":2.5,"70":1.1,"71":0,"72":0.3,"73":5.5,"74":3.9,"75":0.7,"76":0.5,"77":0.2,"78":0.3,"79":0.3,"80":0.8,"81":1.7,"82":4.4,"83":0,"84":1.5,"85":6.1,"86":0,"87":1.3,"88":1.6,"89":0.4,"90":0.1,"91":6.9,"92":0.2,"93":7.3,"94":10.8,"95":2.6,"96":3.9,"97":7.4,"98":2.6,"99":8.1,"100":3.5,"101":8.2,"102":3.1,"103":2.3,"104":2.6,"105":2.2,"106":2.4,"107":6.2,"108":4.9,"109":0.4,"110":3.3,"111":4.6,"112":5.5,"113":18.3,"114":2.2,"115":3.5,"116":2.1,"117":1.5,"118":1.1,"119":0.7,"120":0.1,"121":0.3,"122":1.6,"124":2.1,"125":0.5,"126":2,"127":1.7,"128":0.8,"129":5.1,"130":2.6,"131":2.9,"132":2.8,"133":5.4,"134":3.5,"135":2.1,"136":5,"137":1.2,"138":5.1,"139":7.4,"140":3.4,"141":9.3,"142":7,"143":5.9,"144":4.8,"145":7.1,"146":0.8,"147":1.9,"148":3.6,"149":1.1,"150":2.4,"151":1.6,"152":6,"153":1.7,"154":2.4,"155":4.4,"156":6.6,"157":2.5,"158":7.9,"159":4.5,"160":1.9,"161":1.2,"162":1.2,"163":2.8,"164":1.5,"165":1.8,"166":3.3,"167":1.8,"168":4.2,"169":7,"170":11.3,"171":1.1,"172":0.1,"173":0.3,"174":0.2,"175":1,"176":1.6,"177":3,"178":4.7,"179":3.4,"180":2.7,"181":2.5,"182":1.5,"183":1,"184":1.3,"185":3.6,"186":1.7,"187":0.8,"191":0.2,"199":0},"description":"<div class=\"results_title\">Average trips/day started from each station</div><div class=\"results_group\">Stations with the most trips:<br><ol><li>South Station - 700 Atlantic Ave., 23.4 starts/day</li><li>TD Garden - West End Park (formerly TD Garden - Causeway at Portal Park #1), 18.3 starts/day</li><li>Nashua Street at Red Auerbach Way, 12.8 starts/day</li><li>MIT Vassar St, 11.3 starts/day</li><li>TD Garden - Causeway at Portal Park #2, 10.8 starts/day</li></ol></div><div class=\"results_group\">Stations with the fewest trips:<br><ol><li>Bennington St at Byron St, 0 starts/day</li><li>Piers Park- Marginal St at East Boston Shipyard, 0 starts/day</li><li>Maverick Sq - Lewis Mall, 0 starts/day</li><li>EBNHC - 20 Maverick Sq, 0 starts/day</li><li>Airport T Stop - Bremen St at Brooks St, 0 starts/day</li></ol></div>"},"illustration_starts0startYear2016startMonthstartWeekdaystartHour6789stationStart123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199membergender1":{"trips":{"1":0.1,"2":0.9,"3":1.6,"4":0.8,"5":0.6,"6":0.6,"7":1.3,"8":1,"9":1.8,"10":4.2,"11":0.3,"12":2.6,"13":0.5,"14":2,"15":1.2,"16":1.4,"17":0.4,"18":2.4,"19":0.4,"20":0,"22":0,"23":0,"24":0,"25":0.1,"26":0,"27":0,"30":1.6,"31":1.8,"32":0.4,"33":1.5,"34":2.6,"35":0.7,"36":0.4,"37":1.2,"38":1.9,"39":1.4,"40":1.2,"41":0.6,"42":0.2,"43":1.4,"44":3.1,"45":0.4,"46":2,"47":0.6,"48":0.5,"49":0.1,"50":0.1,"51":0,"52":0.3,"53":0,"54":0,"56":0,"57":0,"58":1.4,"59":1.3,"60":1.1,"61":2.5,"62":0.2,"63":0.6,"64":1.9,"65":1.9,"66":1.5,"67":0.5,"68":0.3,"69":0.8,"70":0.2,"71":0,"72":0,"73":1.3,"74":1.4,"75":0.5,"76":0,"77":0,"78":0.2,"79":0.1,"80":0.4,"81":0.6,"82":1.4,"83":0.1,"84":0.4,"85":1.6,"86":0.1,"87":0.3,"88":0.5,"89":0.3,"90":0.1,"91":2,"92":0.1,"93":1.1,"94":2.4,"95":0.4,"96":1.4,"97":2.1,"98":1.1,"99":0.7,"100":0.5,"101":2.6,"102":0.9,"103":0.3,"104":1,"105":1.2,"106":1.3,"107":3.1,"108":1.9,"109":0.1,"110":0.8,"111":1.2,"112":4.2,"113":3.4,"114":0.6,"115":1.1,"116":1.1,"117":0.4,"118":0.6,"119":0.1,"120":0.1,"121":0,"122":0.8,"124":0.8,"125":0.6,"126":1.4,"127":1.7,"128":0.4,"129":1.2,"130":1,"131":0.9,"132":0.5,"133":1.9,"134":2,"135":1,"136":1.3,"137":0.3,"138":1.9,"139":3.2,"140":1.2,"141":4.9,"142":2.6,"143":3.2,"144":1.7,"145":3.5,"146":0.4,"147":0.8,"148":0.9,"149":0.8,"150":0.8,"151":1.2,"152":2.7,"153":0.6,"154":2.8,"155":3.1,"156":4.3,"157":0.9,"158":3.5,"159":2,"160":0.8,"161":0.6,"162":0.3,"163":1,"164":1,"165":0.7,"166":2.1,"167":0.9,"168":1.3,"169":1.8,"170":2.1,"171":0.3,"172":0.1,"173":0.1,"174":0.1,"175":0.1,"176":0.8,"177":1.9,"178":2.3,"179":2.2,"180":1.5,"181":1.1,"182":0.4,"183":0.6,"184":0.3,"185":1.3,"186":0.4,"187":0.2,"191":0},"description":"<div class=\"results_title\">Average trips/day started from each station</div><div class=\"results_group\">Stations with the most trips:<br><ol><li>Inman Square at Vellucci Plaza / Hampshire St, 4.9 starts/day</li><li>359 Broadway - Broadway at Fayette Street, 4.3 starts/day</li><li>South Station - 700 Atlantic Ave., 4.2 starts/day</li><li>Charlestown - Warren St at Chelsea St, 4.2 starts/day</li><li>Harvard University Housing - 115 Putnam Ave at Peabody Terrace, 3.5 starts/day</li></ol></div><div class=\"results_group\">Stations with the fewest trips:<br><ol><li>Chelsea St at Saratoga St, 0 starts/day</li><li>Piers Park- Marginal St at East Boston Shipyard, 0 starts/day</li><li>Maverick Sq - Lewis Mall, 0 starts/day</li><li>EBNHC - 20 Maverick Sq, 0 starts/day</li><li>The Eddy at New Street, 0 starts/day</li></ol></div>"}};
var reset = false;
var selectAllStations = false;
var kMeansNumberOfClusters = 0;

// store the active set of selected filters;
// by default, we start with the filters specified below (and a few default stations after the map loads)
var selectedFilters = {
    'startYear': {}, 
    'startMonth': {},
    'startWeekday': {},
    'startHour': {},
    'stationStart': {},
    'member': {},
    'gender': {} 
};
   
var markerOptions = {
    'distance': {'stroke': false, 'fillOpacity': 0.15, 'pane': 'data'},
    'vector': { 'stroke': 'blue', 'fillColor': 'none', 'fillOpacity': 0.2, 'pane': 'data'},
    'data': {'stroke': false, 'fillOpacity': 0.5, 'pane': 'data'},
    'default': {'stroke': false, 'fillOpacity': 0.5},
    
    // these two are only used to show bike stations, so colors are hard-coded
    'stationUnselected': {'stroke': false, 'fillOpacity': 0.7, 'fillColor': 'blue'},
    'stationSelected': {'stroke': false, 'fillOpacity': 0.7, 'fillColor': 'red'},    
};

// The number of stations to show text results for
var maxStations = 5;

// user-set marker scale
var markerZoom = 10;
var defaultMarkerRadius = 7.5;

var cssColors = ['navy','blue','green','blueviolet','aquamarine','maroon','goldenrod','burlywood','cadetblue','chartreuse'];


// available filter options for queries
var queryFilters = {
    'day': [
        {'label': 'all', 'set': {'startHour': null}},
        {'label': 'early', 'tooltip': '2:00AM-5:00AM', 'set': {'startHour': [2, 3, 4, 5]}},
        {'label': 'morning', 'tooltip': '6:00AM-10:00AM', 'set': {'startHour': [6, 7, 8, 9]}},
        {'label': 'midday', 'tooltip': '10:00AM-2:00PM', 'set': {'startHour': [10, 11, 12, 13]}},
        {'label': 'afternoon', 'tooltip': '2:00PM-5:00PM', 'set': {'startHour': [14, 15, 16]}},
        {'label': 'evening', 'tooltip': '5:00PM-9:00PM', 'set': {'startHour': [17, 18, 19, 20]}},
        {'label': 'night', 'tooltip': '9:00PM-2:00AM', 'set': {'startHour': [21, 22, 23, 0, 1]}},
    ],
    
    'week': [
        {'label': 'all', 'set': {'startWeekday': null}},
        {'label': 'weekday', 'tooltip': 'Monday-Friday', 'set': {'startWeekday': [0, 1, 2, 3, 4]}},
        {'label': 'weekend', 'tooltip': 'Saturday, Sunday', 'set': {'startWeekday': [5, 6]}}
    ],
    
    'season': [
        {'label': 'all', 'set': {'startMonth': null}},
        {'label': 'spring', 'tooltip': 'March, April, May', 'set': {'startMonth': [3, 4, 5]}},
        {'label': 'summer', 'tooltip': 'June, July, August', 'set': {'startMonth': [6, 7, 8]}},
        {'label': 'fall', 'tooltip': 'September, October, November', 'set': {'startMonth': [9, 10, 11]}},
        {'label': 'winter', 'tooltip': 'December, January, February', 'set': {'startMonth': [12, 1, 2]}}
    ],
    
    'year': [
        {'label': 'all', 'set': {'startYear': null}},
        {'label': '2016', 'set': {'startYear': [2016]}},
        {'label': '2015', 'set': {'startYear': [2015]}},
        {'label': '2014', 'set': {'startYear': [2014]}},
        {'label': '2013', 'set': {'startYear': [2013]}},
        {'label': '2012', 'set': {'startYear': [2012]}},
        {'label': '2011', 'set': {'startYear': [2011]}}
    ],
    
    'member': [
        {'label': 'all', 'set': {'member': null}},
        {'label': 'member', 'tooltip': 'Member', 'set': {'member': [1]}},
        {'label': 'casual', 'tooltip': 'Non-member', 'set': {'member': [0]}},
    ],
    
    'gender': [
        {'label': 'all', 'set': {'gender': null}},
        {'label': 'unspecified', 'set': {'gender': [0]}},
        {'label': 'female', 'set': {'gender': [1]}},
        {'label': 'male', 'set': {'gender': [2]}},                
    ]
};

var stationGroups = [
    {'label': 'Coffee, Coffee', stops: [147, 184, 106]},
    {'label': 'Boston', stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 191, 192, 193, 194, 196, 197]},
    {'label': 'Fort Point', stops: [68, 90, 84, 109, 1, 36, 42, 88, 78, 77]},    
    {'label': 'Brookline', stops: [129, 130, 131, 132, 188, 190]},
    {'label': 'Cambridge', stops: [133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175]},
    {'label': 'Somerville', stops: [176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 189, 195]},
    {'label': 'MIT', stops: [135, 136, 137, 138, 165, 169, 170]},
    {'label': 'Harvard', stops: [6, 7, 15, 131, 145, 146, 147, 148, 150, 151, 153, 154, 166, 192]},
    {'label': 'Tufts', stops: [182, 183, 185, 181]}
];

var kMeansGroups = [0, 3, 5, 7, 10];

//--- kMeans clustering code, inspired by
// https://burakkanber.com/blog/machine-learning-k-means-clustering-in-javascript-part-1/
var kMeans = {

    // global variables
    maxIterations: 100,
    dataExtremes: [],
    dataRanges: [],

    // given an array of multidimensional arrays, return the range for each dimension
    updateDataRangesAndExtremes: function(data) {

        this.ranges = [];
        this.extremes = [];
        
        for (var dimension in data[0]) {        
            var values = data.map(function(x) { return x[dimension]; });
            var min = Math.min.apply(Math, values);
            var max = Math.max.apply(Math, values);
            
            this.dataRanges[dimension] = max - min;
            this.dataExtremes[dimension] = {'min': min, 'max': max};
        }
    },
    
    // generate initial means
    generateInitialMeans: function(numberOfClusters) {
       
        var means = [];
                
        for (var k = 0; k < numberOfClusters; k++) {
            means[k] = [];
            
            for (var dimension in this.dataExtremes) {
                means[k][dimension] = 
                    this.dataExtremes[dimension]['min'] + 
                    (Math.random() * this.dataRanges[dimension]);
            }
        }

        return means;
    },
    
    // assign every data point to a mean
    makeAssignments: function(data, means) {

        var assignments = [];
        
        for (var i in data) {

            var point = data[i];
            var distances = [];

            for (var j in means) {
                var mean = means[j];
                var sum = 0;

                for (var dimension in point) {
                    if (isNaN(point[dimension])) {
                        continue;
                    }
                    var difference = point[dimension] - mean[dimension];
                    difference *= difference;
                    sum += difference;
                }

                distances[j] = sum;
                // distances[j] = Math.sqrt(sum);
            }

            assignments[i] = distances.indexOf(Math.min.apply(Math, distances));
        }

        return assignments;
    },
    
    // modify means based on assignments
    moveMeans: function(data, means, assignments) {

        var sums = Array(means.length);
        var counts = Array(means.length);
        var moved = false;

        for (var j in means) {
            counts[j] = 0;
            sums[j] = Array(means[j].length);
            
            for (var dimension in means[j]) {
                sums[j][dimension] = 0;
            }
        }

        // calculate the sum of every point for every dimension per mean
        for (var point_index in assignments)
        {
            var mean_index = assignments[point_index];
            var point = data[point_index];
            var mean = means[mean_index];

            counts[mean_index]++;

            for (var dimension in mean) {
                sums[mean_index][dimension] += point[dimension];
            }
        }

        for (var mean_index in sums) {

            // if a mean has no points, move it randomly       
            if (counts[mean_index] === 0) {
                sums[mean_index] = means[mean_index];

                for (var dimension in this.dataExtremes) {
                    sums[mean_index][dimension] = 
                        this.dataExtremes[dimension]['min'] + 
                        (Math.random() * this.dataRanges[dimension]);
                }
                
                continue;
            }

            // otherwise, recenter the mean based on the points assigned to it
            for (var dimension in sums[mean_index]) {
                sums[mean_index][dimension] /= counts[mean_index];
            }
        }

        // compare the new to old means and flag if different
        if (means.toString() !== sums.toString()) {
            moved = true;
            means = sums;
        }

        return {'means': means, 'completed': !moved};
    },
    
    getSolutionKey: function(assignments) {

        var clusters = {};
        var key = [];
        
        for (var stationIndex in assignments) {
            var assignedCluster = assignments[stationIndex];
            
            if (clusters[assignedCluster] === undefined) {
                clusters[assignedCluster] = Object.keys(clusters).length;
            }
            
            key[stationIndex] = clusters[assignedCluster];
        }
        
        return key.toString();
    },
    
    run: function(data, numberOfClusters) {

        var solutionSets = {};

        this.updateDataRangesAndExtremes(data);
        
        for (var solutionsCounter = 0; solutionsCounter < 20; solutionsCounter++) {
        
            // generate random centroids and initial assignments
            var means = this.generateInitialMeans(numberOfClusters);
                        
            var assignments = this.makeAssignments(data, means);
        
            // iteratively cluster
            for (var loopCounter = 0; loopCounter < this.maxIterations; loopCounter++) {

                // calculate new means
                var results = this.moveMeans(data, means, assignments);
                means = results['means'];

                // if the old and new mean were the same, then we finished
                if (results['completed']) { 
                               
                    // get unique key for this grouping
                    var key = this.getSolutionKey(assignments);
                
                    // save this solution
                    if (!solutionSets[key]) {
                        solutionSets[key] = {'assignments': assignments, 'means': means, 'count': 1};
                    } else {
                        solutionSets[key]['count']++;
                    }

                    break;
                         
                // if we didn't converge, update cluster assignments and then retry    
                } else {
                    assignments = this.makeAssignments(data, means);
                }
            }
        }   
     
        // return the most popular solutions
        var bestKey;
        Object.keys(solutionSets).forEach(function(key) {
            if (bestKey === undefined || solutionSets[bestKey]['count'] < solutionSets[key]['count']) {
                bestKey = key;
            }
        });

        return solutionSets[bestKey];
    }
};

// generate key for query cache
function getFilterCacheKey(options) {
        
    var key = '';
        
    options.forEach(function(filter) {
        key += filter;

        if (selectedFilters[filter] == null) { 
            return; 

        } else {
            Object.keys(selectedFilters[filter]).forEach(function(unit) {
                key += unit;
            });
        }
    });
  
    return key;
}

// create a hash of filters to use to run a DataSource query
// valid fields: duration, gender, member, startMinute, startYear, startMonth, startWeekday, startHour, stationEnd, stationStart
function updateCache(options) {

    var key = getFilterCacheKey(options);
    
    if (key != cacheKey) {
        cachedDataSource = DataSource.cacheFilter(getFilterOptions(options));    
        cacheKey = key;
    }
}

function getFilterOptions(options) {

    var filter = {};
    
    options.forEach(function(column) {
        if (column == 'stationStart' || column == 'stationEnd') {
            if (Object.keys(Hubway.stations).length == Object.keys(selectedFilters.stationStart).length) {
                filter[column] = null;
            } else {
                filter[column] = Object.keys(selectedFilters[column]);
            }
        }
        filter[column] = selectedFilters[column] == null ? null : Object.keys(selectedFilters[column]);
    });

    return filter;
}

// available queries to run/draw
var illustrations = {

	'starts': {
	    group: 'trips',
	    tooltip: 'total trips started at each station',
	    unit: ' starts/day',
	    unitRounding: 1,
	    markerScale: 10,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
	    clusteringEnabled: true,
  	    draw: function() {
    	    removeMarkers();
        	showStationStatistic('starts', ['trips']);
        },

  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);
  	        var results = DataSource.query(cachedDataSource, "stationStart", null, "sum");

            // just an approximation... 
            // 1. get the number of days of the week
            // 2. multiply by the number of weeks in a month, and then the number of months (either all, or 4 for a season)
            var totalNumberOfDays = (selectedFilters['day'] == null ? 7 : selectedFilters['startWeekday'].length);
            totalNumberOfDays = totalNumberOfDays * 4 * (selectedFilters['startMonth'] == null ? 12 : 4);
            
            var scale = Math.pow(10, illustrations['starts']['unitRounding']);
            Object.keys(results).forEach(function(station) {
                results[station] = Math.round(scale * results[station] / totalNumberOfDays) / scale;
            });
                        
            var description = '<div class="results_title">Average trips/day started from each station</div>';
            description += printTopStations(results, true, maxStations, true, 'Stations with the most trips:');
            description += printTopStations(results, false, maxStations, true, 'Stations with the fewest trips:');

            return {'trips': results, 'description': description};
        }
	},
	
	'stops': {
	    group: 'trips',
	    tooltip: 'total trips ended at each station',
	    unit: 'stops/day',
	    unitRounding: 1,
	    markerScale: 10,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
	    clusteringEnabled: true,	    
  	    draw: function() {
    	    removeMarkers();
  	        showStationStatistic('stops', ['trips']);
        },

  	    queryResults: function() { 
            
            // save the current set of filters            
            var selectedFiltersMainQuery = $.extend(true, {}, selectedFilters);
            selectedFilters['stationEnd'] = $.extend(true, {}, selectedFilters['stationStart']);
            selectedFilters['stationStart'] = {};

            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationEnd', 'member', 'gender']);
            var results = DataSource.query(cachedDataSource, "stationEnd", null, "sum");
            
            // restore the original filter
            selectedFilters = $.extend(true, {}, selectedFiltersMainQuery);

            // just an approximation... 
            // 1. get the number of days of the week
            // 2. multiply by the number of weeks in a month, and then the number of months (either all, or 4 for a season)
            var totalNumberOfDays = (selectedFilters['day'] == null ? 7 : selectedFilters['startWeekday'].length);
            totalNumberOfDays = totalNumberOfDays * 4 * (selectedFilters['startMonth'] == null ? 12 : 4);
                      
            var scale = Math.pow(10, illustrations['stops']['unitRounding']);  
            Object.keys(results).forEach(function(station) {
                results[station] = Math.round(scale * results[station] / totalNumberOfDays) / scale;
            });
                        
            var description = '<div class="results_title">Number of trips ending at each station</div>';
            description += printTopStations(results, true, maxStations, true, 'Stations with the most trips:');
            description += printTopStations(results, false, maxStations, true, 'Stations with the fewest trips:');

            return {'trips': results, 'description': description};            
        }
	},
	    
	'duration': {
	    group: 'trips',
	    tooltip: 'average duration of trips started from each station',
	    unit: 'minutes',
	    unitRounding: 1,
	    markerScale: 10,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
	    clusteringEnabled: true,	    
  	    draw: function() {
    	    removeMarkers();
    	    showStationStatistic('duration', ['duration']);
      	},
      	
  	    queryResults: function() { 

            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);         
            
  	        var results = DataSource.query(
                cachedDataSource,
                "stationStart", // what to group by (can be any field name), or null for no grouping
                "duration",     // what to aggregate (can be any field name), or null to count results
                "mean"          // how to aggregate (can be sum, min, max or mean)
            );

            var scale = Math.pow(10, illustrations['duration']['unitRounding']);
            Object.keys(results).forEach(function(station) {
                results[station] = Math.round(scale * results[station]) / scale;
            });
            
            var description = '<div class="results_title">Average duration of trips started at each station</div>';
            description += printTopStations(results, true, maxStations, true, 'Stations with the longest average trip:');
            description += printTopStations(results, false, maxStations, true, 'Stations with the shortest average trip:');

            return {'duration': results, 'description': description};
        }
	},
	
	'utilization': {
	    group: 'trips',
	    tooltip: 'total trip starts and stops per station, normalized by dock size',
	    unit: 'trips/dock-hour',
	    unitRounding: 3,
	    markerScale: 0.0002,
	    useRawMarkerSize: false,
	    markerOptions: markerOptions.data,
	    clusteringEnabled: true,	    
  	    draw: function() {
  	        removeMarkers();
            showStationStatistic('utilization', ['utilization']);
      	},
      	
  	    queryResults: function() { 

            // save the current set of filters
            var selectedFiltersMainQuery = $.extend(true, {}, selectedFilters);

            var results = {};
            
            //---PEAK START+STOP CALCULATION
            // determine the peak hourly usage ever observed for each station
            // widen the filter to select all months, days, and hours for the current year
            selectedFilters['startMonth'] = null;
            selectedFilters['startWeekday'] = null;
            selectedFilters['startHour'] = null;
        
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour']);
        
            var utilization = DataSource.query(
                cachedDataSource,
                null,                                       // group by
                function(trip) { return trip; },            // what to aggregate (can be any field name), or null to count results
                {
                    ingest: function(v, trip) {
                        if (!v) {
                            v = {};
                        }

                        var startStation = DataSource.FIELDS.stationStart(trip);
                        var endStation = DataSource.FIELDS.stationEnd(trip);
                        
                        // time key: year+month+weekday+hour
                        var key = trip >> 16 & 0x7FFF;

                        if (startStation in v) {
                            v[startStation][key] = 1 + (v[startStation][key] || 0);
                        } else {
                            v[startStation] = {key: 1};
                        }

                        if (endStation in v) {
                            v[endStation][key] = 1 + (v[endStation][key] || 0);
                        } else {
                            v[endStation] = {key: 1};
                        }
                        
                        return v;
                    },
                    
                    finalize: function(v) {
                    
                        var result = {};
                                    
                        Object.keys(v).forEach(function(station) {

                            if (selectedFiltersMainQuery['stationStart'] == null || selectedFiltersMainQuery['stationStart'][station]) {
    
                                result[station] = {'max': -Infinity, 'matchedCounts': []};

                                Object.keys(v[station]).forEach(function(time) {

                                    // add these counts if they match the main query
                                    var trip = time << 16;

                                    var startYear = selectedFiltersMainQuery['startYear'] == null ? 
                                        true : selectedFiltersMainQuery['startYear'][DataSource.FIELDS.startYear(trip)];

                                    var startMonth = selectedFiltersMainQuery['startMonth'] == null ?
                                        true : selectedFiltersMainQuery['startMonth'][DataSource.FIELDS.startMonth(trip)];
                                                 
                                    var startWeekday = selectedFiltersMainQuery['startWeekday'] == null ?
                                        true : selectedFiltersMainQuery['startWeekday'][DataSource.FIELDS.startWeekday(trip)];

                                    var startHour = DataSource.FIELDS.startHour(trip);
                                    var startHourSelected = selectedFiltersMainQuery['startHour'] == null ?
                                        true : selectedFiltersMainQuery['startHour'][startHour];

                                    // update the peak start+stop trips observed
                                    result[station]['max'] = Math.max(result[station]['max'], v[station][time]);
                            
                                    // update the start+stop trips that match the current query filters
                                    if (startYear && startMonth && startWeekday && startHourSelected) {
                                        if (!result[station]['matchedCounts'][startHour]) {
                                            result[station]['matchedCounts'][startHour] = v[station][time];
                                        } else {
                                            result[station]['matchedCounts'][startHour] += v[station][time];
                                        }
                                    }                                    
                                
                                });
                            }
                        });
                                            
                        return result;
                    }
                }
            );

            // restore single-station filter
            selectedFilters = selectedFiltersMainQuery;

            // calculate utilization
            var numberOfYears = selectedFilters['startYear'] == null ? Object.keys(queryFilters['year']).length-1 : Object.keys(selectedFilters['startYear']).length;

            var numberOfDays = selectedFilters['startWeekday'] == null ? 7 : Object.keys(selectedFilters['startWeekday']).length;           
            numberOfDays = selectedFilters['startMonth'] == null ? numberOfDays * 52 : numberOfDays * (52 / 4);
            
            var numberOfHours = selectedFilters['startHour'] == null ? 24 : Object.keys(selectedFilters['startHour']).length;
            
            var results = {'averages': {}};
            
            var scale = Math.pow(10, illustrations['utilization']['unitRounding']);
            Object.keys(utilization).forEach(function(station) {
               
                results['averages'][station] = 0;

                utilization[station]['matchedCounts'].forEach(function(hourlyCount) {
                    results['averages'][station] += hourlyCount;
                });
                
                results['averages'][station] = Hubway.stations[station]['docks'] ? 
                    results['averages'][station] / (Hubway.stations[station]['docks'] * numberOfYears * numberOfDays * numberOfHours) : 0;
                    
                results['averages'][station] = Math.round(scale * results['averages'][station]) / scale;
            });
              
            var description = '<div class="results_title">Capacity utilization</div>';
            description += printTopStations(results['averages'], true, maxStations, true, '(utilization estimated as a percentage of the peak observed hourly number of start+stops)');
                    
            return {'utilization': results['averages'], 'description': description};
        }
	},
	
    'popular-routes': {
        group: 'trips',
        tooltip: 'top five most popular destinations from each station',
        buttonName: 'popular routes',
	    unit: 'trips',
	    unitRounding: 0,
	    markerScale: 1,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.vector,
	    clusteringEnabled: false,	    
  	    draw: function() {
                removeMarkers();
            	showStations();
          	    showStationStatistic('popular-routes', ['direction']);
        },

  	    queryResults: function() {

            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);

            var results = DataSource.query(
                cachedDataSource,
                function(trip) { return trip & 0xffff; }, 
                null,
                null
            );
                        
            var resultsByStation = {};
            Object.keys(results).forEach(function(row) {
                var startStationID = DataSource.FIELDS.stationStart(row);
                var endStationID = DataSource.FIELDS.stationEnd(row);
                
                if (!resultsByStation[startStationID]) {
                    resultsByStation[startStationID] = {};
                }
                
                if (!resultsByStation[startStationID][endStationID]) {
                    resultsByStation[startStationID][endStationID] = 0;
                }
                
                resultsByStation[startStationID][endStationID] = results[row];
            });
                        
            var topStations = {};
            
            var description = '<div class="results_title">Most frequent stops from selected start stations</div>';
   	                
            Object.keys(resultsByStation).forEach(function(station) {
                
                var sortedKeys = sortStations(resultsByStation[station], true);
                
                topStations[station] = sortedKeys.slice(0, maxStations);
                
                var from = '<strong>From:</strong> ' + Hubway.stations[station]['name'];
                description += printTopStations(resultsByStation[station], true, maxStations, true, from);

            });
            
            return {'direction': topStations, 'description': description};
        }       
    },

	'distance-min': {
	    group: 'distance',	
	    unit: 'meters',
	    unitRounding: 0,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.distance,
	    clusteringEnabled: true,	    
  	    draw: function() {
	        removeMarkers();
    	    showStations();
	        showStationStatistic('distance-min', ['min']);
        },
        
  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);

            var min = DataSource.query(cachedDataSource, "stationStart", "distance", "min");

            var scale = Math.pow(10, illustrations['distance-min']['unitRounding']);
            Object.keys(min).forEach(function(station) {
                min[station] = Math.round(scale * min[station]) / scale;
            });                 
            
            var description = '<div class="results_title">Minimum Distance Traveled</div>';
            Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                if (min[station] === undefined) { 
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": no rides during this period</div>";
                            
                } else {
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": " + 
                            min[station] + " " + illustrations['distance-min']['unit'] + '</div>';
                }
            });
            
            return {'min': min, 'description': description};
        }	
	},

	'distance-mean': {
	    group: 'distance',	
	    unit: 'meters',
	    unitRounding: 0,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.distance,
	    clusteringEnabled: true,	    
  	    draw: function() {
	        removeMarkers();
    	    showStations();
	        showStationStatistic('distance-mean', ['mean']);
        },
        
  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);

            var mean = DataSource.query(cachedDataSource, "stationStart", "distance", "mean");

            var scale = Math.pow(10, illustrations['distance-mean']['unitRounding']);
            Object.keys(mean).forEach(function(station) {
                mean[station] = Math.round(scale * mean[station]) / scale;
            });  
            
            var description = '<div class="results_title">Mean Distance Traveled</div>';
            Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                if (mean[station] === undefined) { 
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": no rides during this period</div>";
                            
                } else {
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": " + 
                            mean[station] + " " + illustrations['distance-mean']['unit'] + '</div>';
                }
            });
                
            return {'mean': mean, 'description': description};
        }	
	},

	'distance-max': {
        group: 'distance',
	    unit: 'meters',
	    unitRounding: 0,
	    useRawMarkerSize: true,
	    markerOptions: markerOptions.distance,
	    clusteringEnabled: true,	    
  	    draw: function() {
	        removeMarkers();
    	    showStations();
	        showStationStatistic('distance-max', ['max']);
        },
        
  	    queryResults: function() { 
            
            updateCache(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);

            var max = DataSource.query(cachedDataSource, "stationStart", "distance", "max");

            var scale = Math.pow(10, illustrations['distance-max']['unitRounding']);
            Object.keys(max).forEach(function(station) {
                max[station] = Math.round(scale * max[station]) / scale;
            });             
            
            var description = '<div class="results_title">Max Distance Traveled</div>';
            Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                if (max[station] === undefined) { 
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": no rides during this period</div>";
                            
                } else {
                    description += '<div class="results_group">' + 
                            Hubway.stations[station]['name'] + ": " + 
                            max[station] + " " + illustrations['distance-max']['unit'] + '</div>';
                }
            });
                        
            return {'max': max, 'description': description};
        }	
	}
};

// cluster results with the following format: [{station: number}]
// returns a hash of cluster assignments by station and the corresponding centroid values
function getClusters(results, numberOfClusters) {            
            
    var stationsAsArray = Object.keys(results).map(function(station) { return station; });
    var kMeansInput = stationsAsArray.map(function(station) { return [results[station]]; });
    var kMeansResult = kMeans.run(kMeansInput, numberOfClusters);
    
    var clusters = {};
    for (var index in stationsAsArray) {
        var id = stationsAsArray[index];
        clusters[id] = kMeansResult['assignments'][index];
    }
    
    return {'clusters': clusters, 'means': kMeansResult['means']};
}

// takes a hash of type {id: result} and returns a sorted list of station IDs
// by default, this will return a descending list (from most to least)
function sortStations(resultsByStation, descending) {

    var keys = Object.keys(resultsByStation);
    
    var sortedKeys = keys.sort(function(a, b) {
        if (resultsByStation[a] < resultsByStation[b]) {
            return descending ? 1 : -1;
        } else if (resultsByStation[a] > resultsByStation[b]) {
            return descending ? -1 : 1;
        }
        return 0;
    });
    
    return sortedKeys;
}

// print top results
function printTopStations(resultsByStation, sortByDescending, max, printCounts, title) {

    var sortedKeys = sortStations(resultsByStation, sortByDescending);
    sortedKeys = sortedKeys.slice(0, max);

    var description = '<div class="results_group">' + title + '<br><ol>';

    sortedKeys.forEach(function(station) {
        description += "<li>" + Hubway.stations[station]['name'];
        
        if (printCounts) {
            description += ", " + resultsByStation[station] + " " + illustrations[activeStatistic]['unit'];
        }
        
        description += "</li>";
    });

    description += '</ol></div>';
    
    return description;
}



// add filter buttons
function setupFilters(defaults) {

    Object.keys(queryFilters).forEach(function(group) {
        var newFilter = '<div class="filter"><div id="js_' + group + '" class="btn-group"></div></div>';
        $("#js_filters").append(newFilter);
    });

    Object.keys(queryFilters).forEach(function(group) {
        var filters = '';
    
        queryFilters[group].forEach(function(button) {
            var label = button['label'];
            var id = "js_" + group + "_" + label;
            var tooltip = button['tooltip'];
        
            if (tooltip) {
                filters += "<button class='btn btn-default btn-sm js_" + group + "' id='" + id + "' title='" + tooltip + "'>" + label + "</button>";
            } else {
                filters += "<button class='btn btn-default btn-sm js_" + group + "' id='" + id + "'>" + label + "</button>";        
            }            
        });
    
        // add buttons to the DOM
        $("#js_"+group).html(filters);
	    $(".btn").tooltip({container: "#js_filters"});
    
        // attach event handlers
        queryFilters[group].forEach(function(button) {
    
            var label = button['label'];
            var id = "js_" + group + "_" + label;
            var filter = button['set'];

            $("#"+id).on("click", function() {
                    
                Object.keys(filter).forEach(function(a) {
                    if (filter[a] == null) {
                        selectedFilters[a] = null;
                    } else {  
                        selectedFilters[a] = {};
                        filter[a].forEach(function(unit) {
                            selectedFilters[a][unit] = true;
                        });
                    }
                });
            
                $(".js_"+group).removeClass('active');
                $(this).addClass('active');
            
                redraw();
            });
            
            // make button active if it is the default
            // and add its filter
            if (id in defaults) {
                $("#"+id).addClass("active");
                $("#"+id).trigger("click");
            }
                        
        });
    });
}

// update filter buttons to show the current query
function refreshQueryButtons(query) {
    $(".js_query").removeClass('active');
    $("#js_"+query).addClass("active");
}


//--- BEGIN STATION display/selection functions

// add station markers
function showStations() {

    Object.keys(Hubway.stations).forEach(function(id) {
    
        var row = Hubway.stations[id];
        
        var description = '['+ id + '] ' + row.name + ', ' + row['docks'] + ' bikes';        
        var marker = addMarker(row.latitude, row.longitude, description, "default", 10 * defaultMarkerRadius, markerOptions.default, activeStation === +id);
        marker.setStyle(markerOptions.stationUnselected);

        marker.bindPopup(description, {autoPan: false});
        marker.on('mouseover', function (e) { this.openPopup(); });
        marker.on('mouseout', function (e) { this.closePopup(); });

        // add a reference to the original data
        Hubway.stations[id]['marker'] = marker;                
                        
        if (selectedFilters['stationStart'][row.id]) {
            selectedFilters['stationStart'][row.id] = {'row': row, 'marker': marker};
            marker.setStyle(markerOptions.stationSelected);        
        }
        
        marker.on('click', function (e) { 
            if (!selectedFilters['stationStart'][row.id]) {            
                selectStation(row.id);
            } else {
                removeStation(row.id);
            }
        });
        
    });
}

// select a particular station
function selectStation(id) {

    reset = false;
    delete selectedFilters.stationStart[-1];

    var marker = Hubway.stations[id]['marker'];
                
    selectedFilters['stationStart'][id] = {'row': Hubway.stations[id], 'marker': marker};
    marker.setStyle(markerOptions.stationSelected);

    if (!selectAllStations) {
        redraw();
    }
    
    displaySelectedStationsText();    
}

// remove a particular station
function removeStation(id) {
    
    if (id != -1) {
        var marker = Hubway.stations[id]['marker'];
        marker.setStyle(markerOptions.stationUnselected);

        delete selectedFilters['stationStart'][id];
    }
    
    if (!selectAllStations) {
        redraw();
    }           
    
    displaySelectedStationsText();         
}

// update text with selected stations
function displaySelectedStationsText() {

    var description = '<div class="results_title">Selected stations:</div><div class="results_group">';
    
    Object.keys(selectedFilters['stationStart']).forEach(function(id) {
        if (id == -1) { return; }
        description += Hubway.stations[id]['name'] + '<br>';
    });
    
    description += '</div>'
    
    $("#js_description").html(description);  
}

//---END STATION FUNCTIONS


//---BEGIN MAP DRAWING FUNCTIONS
function showStationStatistic(forStatistic, properties) {
    
    // always remove the data layer to update it
    if (activeMarkers['data']) {
        activeMarkers['data'].forEach(function(marker) {
            map.removeLayer(marker);
        });
    }

    // try to grab results from the cache first
    var cacheKey = "illustration_" + forStatistic + kMeansNumberOfClusters + getFilterCacheKey(['startYear', 'startMonth', 'startWeekday', 'startHour', 'stationStart', 'member', 'gender']);
    
    var queryResults, meansSorted, means;
    if (illustrationCache[cacheKey]) {
        queryResults = illustrationCache[cacheKey];
        meansSorted = queryResults['clusterMeansSorted'];
        means = queryResults['clusterMeansOriginalArray'];

    } else {
        // check loading
        if (!DataSource.isLoaded()) {
            var loading = createLoadingOverlay(map.getContainer());
            loading.text("Downloading 5,000,000 trips...");
            DataSource.loadData("data/trips.bin", "data/stations.json")
                .done(function() {
                    showStationStatistic(forStatistic, properties);
                })
                .fail(function() {
                    // really ungraceful
                    window.Story && window.Story.showOverlay("Unable to load ride information. Please try refreshing.");
                })
                .always(function() { loading.remove(); });
            return;
        }
    
        queryResults = illustrations[forStatistic].queryResults();

        // if clustering is enabled, assign each point to a group
        if (kMeansNumberOfClusters && illustrations[forStatistic]['clusteringEnabled']) {
            var clusterBy = properties[0];
            var kMeansResults = getClusters(queryResults[clusterBy], kMeansNumberOfClusters);
        
            queryResults['clusters'] = kMeansResults['clusters'];
            queryResults['clusterMeans'] = kMeansResults['means'];
            
            var means = [];
            var meansSorted = [];
    
            queryResults['clusterMeans'].forEach(function(mean) { 
                means.push(mean[0]);
                meansSorted.push(mean[0]);
            });
                
            meansSorted.sort(function(a, b) { 
                if (a < b) {
                    return -1;
                } else if (a > b) {
                    return 1;
                }
        
                return 0;
            });
            
            queryResults['clusterMeansSorted'] = meansSorted;
            queryResults['clusterMeansOriginalArray'] = means;
        }
        
        // save results to the cache 
        illustrationCache[cacheKey] = queryResults;
        
        console.log(JSON.stringify(illustrationCache));
    }

    // assign clusters colors in order for consistency
    if (kMeansNumberOfClusters && illustrations[forStatistic]['clusteringEnabled']) {
        meansSorted.forEach(function(x) {
            defineCluster(means.indexOf(x));
        });
    }

    properties.forEach(function(property) {

        // add a vector
        if (property === 'direction') {

            Object.keys(queryResults[property]).forEach(function(id) {
    
                var startStation = Hubway.stations[id];

                var maxEndStations = queryResults[property][id].length < 5 ? 
                                        queryResults[property][id].length : 5;
            
                for (var i=0; i < maxEndStations; i++) {
                    var endStationIndex = queryResults[property][id][i];
                    var endStation = Hubway.stations[endStationIndex];
                
                    addVector(startStation.latitude, startStation.longitude, endStation.latitude, endStation.longitude, "default");
                };
            });
        }
    
        // add a marker
        else {

            var markerScale = illustrations[forStatistic].markerScale;

            Object.keys(queryResults[property]).forEach(function(id) {
 
                var station = Hubway.stations[id];
                var markerSize = queryResults[property][id];
                if (isNaN(markerSize)) {
                    return;
                } 
                
                var description = station['name'] + ", " + markerSize + " " + illustrations[forStatistic]['unit'];

                var useRawMarkerSize = illustrations[forStatistic].useRawMarkerSize;
        
                if (!useRawMarkerSize) {
                    markerSize = markerScale ? markerZoom * markerSize * Math.sqrt(defaultMarkerRadius / markerScale) : 0;
                }

                var cluster = "default";
                if (queryResults['clusters']) {
                    cluster = queryResults['clusters'][id];
                } else if (properties.length > 1) {
                    cluster = property;
                }

                var marker = addMarker(
                    station.latitude, station.longitude, description, 
                    cluster, markerSize, illustrations[forStatistic].markerOptions,
                    activeStation === +id); 
    
                marker.bindPopup(description, {autoPan: false});
                marker.on('mouseover', function (e) { this.openPopup(); });
                marker.on('mouseout', function (e) { this.closePopup(); });
           });
       }
   });
   
   // add description
   $("#js_description").html(queryResults['description']);       
}

function defineCluster(kMeansLabel) {
    if (clusters[kMeansLabel] === undefined) {
        clusters[kMeansLabel] = Object.keys(clusters).length;
    }
}

function addMarker(latitude, longitude, description, kMeansLabel, radius, options, is_active) {
   
    defineCluster(kMeansLabel);
    
    var color = cssColors[clusters[kMeansLabel]];
    
    var markerOptions = {'stroke': options.stroke, 
                         'fillColor': color, 
                         'fillOpacity': options.fillOpacity,
                         'pane': options.pane};
    
    if (options.pane) {
        markerOptions['pane'] = options.pane;
    }
    if (is_active) {
    	markerOptions['className'] = 'station-active';
    }

    // add the marker to the map and save a reference    
    var marker = L.circle([latitude, longitude], radius, markerOptions).addTo(map);
    
    var key = options['pane'] ? options['pane'] : "default";
    if (!activeMarkers[key]) {
        activeMarkers[key] = [marker]; 
    } else { 
        activeMarkers[key].push(marker);
    }

    return marker;
}

function addVector(startLat, startLong, endLat, endLong, kMeansLabel) {

    if (clusters[kMeansLabel] === undefined) {
        clusters[kMeansLabel] = Object.keys(clusters).length;
    }

    if (startLat - endLat !== 0 || startLong - endLong !== 0) {
        var polyline = [[startLat, startLong], [endLat, endLong]];
    
        var line = L.polyline(polyline, markerOptions.vector).addTo(map);
    
        if (!activeMarkers['data']) {
            activeMarkers['data'] = [];
        }
    
        activeMarkers['data'].push(line);

    } else {
        
        var line = L.circle([startLat, startLong], 200, markerOptions.vector).addTo(map);    
    
        if (!activeMarkers['data']) {
            activeMarkers['data'] = [];
        }
    
        activeMarkers['data'].push(line);       
    }
}

// remove all markers from the map
function removeMarkers() {

    Object.keys(activeMarkers).forEach(function(key) {
        activeMarkers[key].forEach(function(marker) {
            map.removeLayer(marker);
        });
    });
    
    clusters = {};    
    activeMarkers = { 'default': [] };
}

// add a "loading" message over the map
function createLoadingOverlay(obj) {
	var ret = $();
    	
	$(obj).each(function() {
		var $obj = $(this);
	
		// get position information
		var pos = $obj.position();
		pos.width = $obj.width();
		pos.height = $obj.height();
		pos.lineHeight = pos.height + "px"; // same line height
		
		// configure overlay
		var el = $('<div class="loading-overlay">Loading...</div>').insertAfter($obj).css(pos);
		
		// add element
		ret = ret.add(el);
	});
	
	return ret;
}

// if data is shown, redrawn it
function redraw() {
    if (activeStatistic) {

     	var loading = createLoadingOverlay(map.getContainer());
        setTimeout(function() { illustrations[activeStatistic].draw(); loading.remove(); }, 0);
    }
}

function setActiveStatistic(statistic, should_redraw) {
	refreshQueryButtons(statistic);
	activeStatistic = statistic;

	if (!reset && ("undefined" === typeof should_redraw || false !== should_redraw)) {
		redraw();
	}
}

function resetMap() {
	removeMarkers();
	activeStatistic = null;
	activeStation = null;
	selectedFilters['stationStart'] = {'-1': true};
	showStations();
	$(".js_query").removeClass("active");
	$("#js_description").html('<div class="results_title">No Selected Bike Stations</div>');
	reset = true;
}

//---END MAP DRAWING FUNCTIONS

function addToMap(new_map) {
    // already added (singleton)
    if (map) {
        return $.Deferred().resolve().promise();
    }

    map = new_map;

	var loading = createLoadingOverlay(map.getContainer());

	map.createPane('data');
	map.getPane('data').style.zIndex = 299;

	// redraw points after zoom
	map.on('zoomend', function() {
	    redraw();
	});

    // load data source
	var ret = DataSource.loadStations("data/stations.json")
		.done(function() {
		
			// LOADED, READY TO GO
			Hubway['stations'] = DataSource.stationsByID();
			
            // draw all station markers
            showStations();
        
            // add "all stations" group
            $("#js_stationList").append("<li><a id='js_stations_select'>Select All</a></li><li class='divider'></li>");
            $("#js_stations_select").on("click", function() {
                selectAllStations = true;
                selectedFilters['stationStart'] = {};
                Object.keys(Hubway.stations).forEach(function(id) {
                    selectStation(id);
                });
                $("#js_description").html('<div class="results_title">All Bike Stations Selected</div>');
                selectAllStations = false;
        
                redraw();
            });
        
            for (var index = 0; index < stationGroups.length; index++) {

                var label = stationGroups[index].label;
                var id = "js_stationGroup_" + index;
                $("#js_stationList").append("<li><a id='" + id + "' class='disabled'>" + label + "</a></li>");

                $("#"+id).on("click", function() {
                                                
                    // unselect all selected stations
                    Object.keys(selectedFilters['stationStart']).forEach(function(station) {
                        removeStation(station);
                    });                
    
                    // subtract the number of items already added to the stations list
                    var selectedItem = $(this).parent('li').index() - 2;
                    
                    stationGroups[selectedItem]['stops'].forEach(function(id) {
                        selectStation(id);
                    });
                
                    $("#js_stations").removeClass("active");
                });
            }
        
            // select default stations
            $("#js_stationGroup_0").trigger("click");
            displaySelectedStationsText();            	

            // remove loading
            loading.remove();
		})
		.fail(function(err) {
			// TODO: error handling
			console.log("ERROR:", err);
		});

	// draw station button
	$("#js_stations_reset").on("click", resetMap);
	
	// set up clusters dropdown
    kMeansGroups.forEach(function(label) {

        var id = "js_kMeansGroups_" + label;
        $("#js_kMeansGroups").append("<li><a id='" + id + "' class='disabled'>" + label + "</a></li>");

        $("#"+id).on("click", function() {

            kMeansNumberOfClusters = label;
            $("#js_kMeans").text("Clusters: " + kMeansNumberOfClusters);
            
            redraw();
        });
    });
	
	// lay out queries
	var currentGroup;
	Object.keys(illustrations).forEach(function(query) {
	    
	    if (currentGroup == undefined) {
	        currentGroup = illustrations[query]['group'];

	    } else if (currentGroup !== illustrations[query]['group']) {
	        currentGroup = illustrations[query]['group'];
	        $("#js_queries").append('<br>');
	    }
	    
	    var name = illustrations[query]['buttonName'] ? illustrations[query]['buttonName'] : query;
	    
	    var tooltip = illustrations[query]['tooltip'] ? 'title="' + illustrations[query]['tooltip'] + '"': '';
	    var button = '<button class="btn btn-default btn-sm js_query" id="js_' + query + '" ' + tooltip + ' >' + name + '</button>';
	    
	    $("#js_queries").append(button);


	    $("#js_"+query).on("click", function() {
	        setActiveStatistic(query);
	    });
	});
	
	$("#js_markerSize_minus").on("click", function() {
    	if (activeStatistic && !illustrations[activeStatistic]['useRawMarkerSize']) {
    	    markerZoom /= 2;
    	    redraw();
    	}
	});

	$("#js_markerSize_plus").on("click", function() {
    	if (activeStatistic && !illustrations[activeStatistic]['useRawMarkerSize']) {
        	markerZoom *= 2;
        	redraw();
        }
	});
	
    // lay out filters
    setupFilters({
        'js_year_2016':true,
        'js_season_all':true,
        'js_week_all':true,
        'js_day_all':true,
        'js_member_all':true,
        'js_gender_all':true
    });

    return ret;
}

// export global object providing an API into
var root = this;
root.ExploreTool = {
    prepareDataSource: function() {
        // can be called multiple times, just starts loading data to have ready
        if (!DataSource.isLoaded()) {
	        DataSource.loadData("data/trips.bin", "data/stations.json");
        }
    },
    addToMap: addToMap,
    setFilters: function(filter_names, should_redraw) {
        // suppress redraw
	    var last_active = activeStatistic;
	    activeStatistic = null;

        for (var i = 0; i < filter_names.length; ++i) {
            if (0 === $("#" + filter_names[i]).trigger("click").length) {
                throw "unknown filter: " + filter_names[i];
            }
        }

        // restore active statistic
        activeStatistic = last_active;

	    // redraw map
	    if ("undefined" === typeof should_redraw || false !== should_redraw) {
		    redraw();
	    }
    },
    setActiveStatistic: setActiveStatistic,
    setStations: function(station_ids, should_redraw) {
	    var i;

        // suppress redraw
        selectAllStations = true;

        // remove existing stations
        var to_remove = Object.keys(selectedFilters['stationStart']);
        for (i = 0; i < to_remove.length; ++i) {
            if (-1 === station_ids.indexOf(to_remove[i])) {
	            removeStation(to_remove[i]);
            }
        }

        // add new stations
        for (i = 0; i < station_ids.length; ++i) {
            selectStation(station_ids[i]);
        }

        // stop suppressing redraw
        selectAllStations = false;

        // redraw map
	    if ("undefined" === typeof should_redraw || false !== should_redraw) {
		    redraw();
	    }
    },
    setAllStations: function(should_redraw) {
	    // suppress redraw
	    selectAllStations = true;

	    // add new stations
	    Object.keys(Hubway.stations).forEach(selectStation);

	    // stop suppressing redraw
	    selectAllStations = false;

	    // redraw map
	    if ("undefined" === typeof should_redraw || false !== should_redraw) {
		    redraw();
	    }
    },
    setStationGroupByLabel: function(label, should_redraw) {
        for (var i = 0; i < stationGroups.length; ++i) {
            if (label === stationGroups[i].label) {
                this.setStations(stationGroups[i]['stops'], should_redraw);
                return;
            }
        }
        throw "unknown group: " + label;
    },
    setClusters: function(clusters, should_redraw) {
	    // suppress redraw
	    var last_active = activeStatistic;
	    activeStatistic = null;

	    // set number of clusters
        if (0 === $("#js_kMeansGroups_" + (clusters || "0")).trigger("click").length) {
            throw "unsupported number of clusters: " + clusters;
        }

	    // restore active statistic
	    activeStatistic = last_active;

	    // redraw map
	    if ("undefined" === typeof should_redraw || false !== should_redraw) {
		    redraw();
	    }
    },
    setMarkerSize: function(marker_size, should_redraw) {
        markerScale = marker_size;

	    if ("undefined" === typeof should_redraw || false !== should_redraw) {
		    redraw();
	    }
    },
    setActiveStation: function(station_id, should_redraw) {
	    activeStation = station_id;

	    if ("undefined" === typeof should_redraw || false !== should_redraw) {
		    redraw();
	    }
    },
    showStations: showStations,
    resetMap: resetMap,
    clearMap: function() {
        activeStatistic = null;
        activeStation = null;
        removeMarkers();
    }
};

}).call(this, jQuery);
