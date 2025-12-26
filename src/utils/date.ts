export const formatTimestamp = (date: Date) => {
	return new Intl.DateTimeFormat('sv-SE', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	}).format(date);
};

export const getRelativeTime = (date: Date, withoutSuffix = false) => {
	const diff = (date.getTime() - Date.now()) / 1000;
	const units: [number, Intl.RelativeTimeFormatUnit][] = [
		[31536000, 'year'],
		[2592000, 'month'],
		[86400, 'day'],
		[3600, 'hour'],
		[60, 'minute'],
		[1, 'second'],
	];

	const [val, unit] = units.find(([v]) => Math.abs(diff) >= v) || [1, 'second'];
	const count = Math.trunc(diff / val);

	if (withoutSuffix) {
		const absCount = Math.abs(count);
		return `${absCount} ${unit}${absCount !== 1 ? 's' : ''}`;
	}

	return new Intl.RelativeTimeFormat('en', { numeric: 'always' }).format(
		count,
		unit,
	);
};
