
const key = 'obtainium';

const logo = `
<svg class="main-icon" viewBox="26 26 90 90" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
	<defs id="defs2">
		<linearGradient id="linearGradient3657">
			<stop style="stop-color: rgb(155, 88, 220); stop-opacity: 1; --darkreader-inline-stopcolor: var(--darkreader-text-9b58dc, #a060de);" offset="0" id="stop3653" data-darkreader-inline-stopcolor=""></stop>
			<stop style="stop-color: rgb(50, 28, 146); stop-opacity: 1; --darkreader-inline-stopcolor: var(--darkreader-text-321c92, #846ee3);" offset="1" id="stop3655" data-darkreader-inline-stopcolor=""></stop>
		</linearGradient>
		<linearGradient id="linearGradient945">
			<stop style="stop-color: rgb(155, 88, 220); stop-opacity: 1; --darkreader-inline-stopcolor: var(--darkreader-text-9b58dc, #a060de);" offset="0" id="stop941" data-darkreader-inline-stopcolor=""></stop>
			<stop style="stop-color: rgb(50, 28, 146); stop-opacity: 1; --darkreader-inline-stopcolor: var(--darkreader-text-321c92, #846ee3);" offset="1" id="stop943" data-darkreader-inline-stopcolor=""></stop>
		</linearGradient>
		<linearGradient xlink:href="#linearGradient945" id="linearGradient947" x1="76.787094" y1="113.40435" x2="110.68458" y2="152.48038" gradientUnits="userSpaceOnUse" gradientTransform="translate(-0.04012535,0.02025786)"></linearGradient>
		<linearGradient xlink:href="#linearGradient3657" id="linearGradient3659" x1="76.787094" y1="113.40435" x2="110.68458" y2="152.48038" gradientUnits="userSpaceOnUse" gradientTransform="translate(-0.04012535,0.02025786)"></linearGradient>
	</defs>
	<g id="layer1" transform="translate(-30.394373,-54.680428)">
		<path style="fill:url(#linearGradient3659);fill-opacity:1;stroke:url(#linearGradient947);stroke-width:0.139;stroke-dasharray:none" d="m 109.8808,153.22596 c -0.73146,-0.38777 -5.00657,-2.75679 -25.032416,-13.87149 -5.57273,-3.09297 -10.93823,-6.06723 -11.92332,-6.60948 -2.23728,-1.23152 -2.58105,-1.53456 -2.58105,-2.27528 0,-0.3879 0.89293,-2.87231 2.98561,-8.30689 1.64209,-4.2644 3.09426,-8.0014 3.22705,-8.30444 0.3024,-0.69008 0.78972,-1.27621 1.26573,-1.52236 0.44558,-0.23042 11.58052,-4.29685 12.14814,-4.43644 0.61355,-0.1509 1.1428,0.13977 1.45487,0.79901 0.14976,0.31638 0.77213,1.94934 1.38303,3.6288 0.6109,1.67945 1.52036,4.16275 2.02104,5.51844 1.14709,3.10604 1.18992,3.54589 0.3912,4.01771 -0.2117,0.12505 -1.58874,0.66539 -3.06009,1.20075 -1.47136,0.53536 -2.87533,1.08982 -3.11993,1.23213 -0.56422,0.32826 -0.64913,0.83523 -0.20815,1.24273 0.17523,0.16193 3.00434,1.77571 6.28691,3.58618 9.174936,5.06035 8.665596,4.83136 9.277626,4.17097 0.29987,-0.32356 5.78141,-14.266 6.09596,-15.50521 0.1344,-0.5295 0.11969,-0.60308 -0.16695,-0.83519 -0.39165,-0.31714 -0.335,-0.33071 -3.93797,0.9431 -3.56937,1.26192 -3.90926,1.28864 -4.38744,0.34488 -0.25108,-0.49556 -4.095796,-11.05481 -4.334456,-11.90432 -0.15438,-0.5495 0.0344,-1.0717 0.49701,-1.37482 0.19228,-0.12598 2.990116,-1.19935 6.217406,-2.38526 4.78924,-1.75986 6.0081,-2.15842 6.63117,-2.16837 0.8037,-0.0128 0.90917,0.0424 15.64514,8.19599 1.02104,0.56495 1.56579,1.15961 1.56579,1.70925 0,0.21814 -3.6538,9.91011 -8.11957,21.53771 -6.2982,16.39877 -8.19916,21.21114 -8.4744,21.45338 -0.46789,0.41179 -0.8512,0.39392 -1.74794,-0.0815 z" id="path239"></path>
	</g>
</svg>
`

export function getModuleConfig() {
    return {
        title: 'Obtainium',
        logo,
		type: key,
        background: {
            color1: 'rgb(68, 62, 77)',
            color2: 'rgb(19, 2, 28)',
        },
        button: {
            color: 'rgb(255, 205, 57)',
        },
    }
}
