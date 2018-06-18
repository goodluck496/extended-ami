export function isUndefined( value: any ): boolean {
	return value === undefined;
}


export function isNull( value: any ): boolean {
	return value === null;
}

export function isEmpty( value: any ): boolean {

	if( isNull( value ) ) return true;
	if( isUndefined( value ) ) return true;
	if( isUndefined( value.length ) ) return true;
	else if( value.length == 0 ) return true;

	return false;
}

export function isNaN( value: any ) {
	return isNumber( value ) && value != +value;
}

export function isNumber( value: any ): boolean {
	return typeof  +value === "number";
}

export function toNumber( value: any ): number {

	if( isNull( value ) ) return null;
	if( isUndefined( value ) ) return null;
	if( isNaN( value ) ) return null;

	return ( isNumber( value ) ) ? +value : null;
}

export function isFinite( value: number ): boolean {
	if( isUndefined( value ) ) return false;
	if( isNull( value ) ) return false;
	if( isNaN( value ) ) return false;

	if( isNumber( value ) ) return true;
}

export function indexOfArray( array: any[], value: any ): number {

	for( let i = 0; i < array.length; i++ ) {

		let item = array[ i ];

		for( let key in item ) {

			if( item[ key ] == value ) return i;

		}
	}

	return -1;
}