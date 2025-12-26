/**
 * To introduce some advanced html fragments.
 *
 * Source: https://stackoverflow.com/questions/19929641/how-to-append-an-html-string-to-a-documentfragment
 *
 * Ref: https://github.com/remotely-save/remotely-save/blob/master/src/misc.ts
 * @param string
 * @returns
 */
const stringToFragment = (string: string) => {
	const wrapper = document.createElement('template');
	wrapper.innerHTML = string;
	return wrapper.content;
};

export default stringToFragment;
