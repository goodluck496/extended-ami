/*
*
* Asterisk manager for Asterisk versions 12, 13, 14, 15
*
* */

'use strict';

import { Socket } from "net";
import { _indexOfArray, _isEmpty, _isFinite, _isNull, _isUndefined, _toNumber } from "./functions";
import { IeAmiOptions } from "./interfaces/configure.interface";
import { I_ActionLogin, I_Request, I_Response, } from "./interfaces/actions.interface";
import {
	_AMI_EVENTS,
	_eAMI_EVENTS,
	CRLF,
	DEFAULT_PORT,
	END,
	HEARTBEAT_INTERVAL,
	MAX_RECONNECT_COUNT, RESEND_TIMEOUT,
} from "./constants";
import { eAmiActions } from "./e-ami-actions";
import { EventEmitter } from "events";
import Timer = NodeJS.Timer;

export const eAMI_EVENTS = _eAMI_EVENTS;
export const AMI_EVENTS = _AMI_EVENTS;

export class eAmi {
	public debug: boolean;

	private _host: string;
	private _port: number;
	private _userName: string;
	private _password: string;

	private _isLoggedIn: boolean;
	private _emitAllEvents: boolean;
	private _reconnect: boolean;
	private _heartbeatOk: boolean;

	private _lastConnectedTime: number;
	private _maxReconnectCount: number;
	private _heartbeatInterval: number;
	private _heartbeatHandler: Timer;
	private _resendTimeOut: number;
	private _successBitsByInterval: number;
	private _errorBitsByInterval: number;

	private _countReconnect: number;

	private _excludeEvents: string[];

	private _queueRequest: I_Request[];
	private _socketHandler: Socket;
	private _actions: eAmiActions;
	public events: EventEmitter;

	private _maxAuthCount: number;
	private _authCount: number;

	constructor( allOptions: IeAmiOptions ) {

		let connect = allOptions,
			options = _isUndefined( connect.additionalOptions ) ? {} : connect.additionalOptions;

		this._host = connect.host;
		this._port = _isNull( connect.port ) ? DEFAULT_PORT : connect.port;
		this._userName = connect.userName;
		this._password = connect.password;

		this._reconnect = _isUndefined( options.reconnect ) ? true : options.reconnect;
		this._heartbeatInterval = _isUndefined( options.heartbeatInterval ) ? HEARTBEAT_INTERVAL * 1000 : options.heartbeatInterval * 1000;
		this._resendTimeOut = _isUndefined( options.resendTimeOut ) ? RESEND_TIMEOUT * 1000 : options.resendTimeOut * 1000;
		this._excludeEvents = _isUndefined( options.excludeEvents ) || _isEmpty( options.excludeEvents ) ? [] : options.excludeEvents;
		this._emitAllEvents = _isUndefined( options.emitAllEvents ) ? false : options.emitAllEvents;
		this.debug = _isUndefined( options.debug ) ? false : options.debug;

		this._maxReconnectCount = _isUndefined( options.maxReconnectCount ) ? MAX_RECONNECT_COUNT : options.maxReconnectCount;

		this._countReconnect = 0;
		this._maxAuthCount = 5;
		this._authCount = 0;
		this._successBitsByInterval = 0;
		this._errorBitsByInterval = 0;

		this.events = new EventEmitter();

		this._queueRequest = [];

		this._isLoggedIn = false;

		this._actions = new eAmiActions( this );

		this.internalListeners();
	}

	private internalListeners() {
		this.events.on( eAMI_EVENTS.RE_LOGIN, () => {
			if( this._authCount < this._maxAuthCount ) {
				setTimeout( async () => {
					this._authCount++;
					try {
						await this.login();
					} catch( error ) {
						if( this.debug ) console.log( "re-login", error );
					}


				}, 1000 );

			}
		} );
	}

	get excludeEvents(): string[] {
		return this._excludeEvents;
	}

	set excludeEvents( events: string[] ) {
		this._excludeEvents = events;
	}

	get isLoggedIn(): boolean {
		return this._isLoggedIn;
	}

	get lastConnectTime(): number {
		return this._lastConnectedTime;
	}

	get actions(): eAmiActions {
		return this._actions;
	}

	get queueRequest(): I_Request[] {
		return this._queueRequest;
	}

	private addSocketListeners(): void {
		this._socketHandler
			.on( "close", () => {
				if( this.debug ) console.log( "close AMI connect" );
			} )
			.on( "end", () => {
				if( this.debug ) console.log( "end AMI connect" );
			} )
			.on( "data", ( buffer: BufferSource ) => this.getData( buffer ) );
	}

	private destroySocket(): void {
		this._socketHandler.destroy();
		if( this.debug ) console.log( CRLF + "Socket connection destroyed" );
	}

	private addRequest( request: I_Request ): void {
		this.queueRequest.push( request );
		this.events.emit( eAMI_EVENTS.SEND, request );
	}

	private removeRequest( actionID: any ): boolean {

		if( _isUndefined( actionID ) ) return false;

		let index: number = _indexOfArray( this.queueRequest, actionID );

		if( index < 0 ) return false;
		try {
			this.queueRequest.splice( index, 1 );
			return true;
		} catch( error ) {
			if( this.debug ) console.log( "Error remove request", error );
			return false;
		}

	}

	public getRequest( actionID: any ): I_Request | boolean {
		if( _isUndefined( actionID ) ) return false;
		if( isFinite( _toNumber( actionID ) ) ) actionID = _toNumber( actionID );

		let index: number = _indexOfArray( this.queueRequest, actionID );

		if( index < 0 ) return false;

		return this.queueRequest[ index ];

	}

	private setRequest( actionID: any, newRequest: I_Request ): void {
		let request = this.getRequest( actionID );

		if( request === false ) return;

		request = newRequest;
	}

	private keepConnection(): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {

			clearInterval( this._heartbeatHandler );
			let countRetrySend = 0;

			try {

				let response: boolean = await this.actions.Ping();

				if( response ) {
					this._heartbeatOk = true;
					resolve( true );
					this._successBitsByInterval++;
				}

				this._heartbeatHandler = setTimeout( async () => {

					try {
						await this.keepConnection();
					} catch( error ) {
						console.log( "keep timeout error", error );
						this._errorBitsByInterval++;
					}

				}, this._heartbeatInterval );

			} catch( error ) {
				this._errorBitsByInterval++;
				console.log( "keep connect error", error );
			}
		} );
	}

	private login(): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {
			try {

				let loginOptions: I_ActionLogin = {
					Username: this._userName,
					Secret: this._password,
				};

				this.events.emit( eAMI_EVENTS.DO_LOGIN, loginOptions );

				await this.actions.Login( loginOptions );

				this.events.emit( eAMI_EVENTS.LOGGED_IN );

				resolve( true );
			} catch( error0 ) {

				this.events.emit( eAMI_EVENTS.ERROR_LOGIN, error0, "Authorization failed..." );

				if( this._authCount < this._maxAuthCount ) {
					setTimeout( () => {
						this._authCount++;
						this.events.emit( eAMI_EVENTS.RE_LOGIN, this._authCount );

					}, 1000 );

				} else {

					this.events.emit( eAMI_EVENTS.MAX_AUTH_REACH, this._authCount );

					try {
						await this.reconnect();
					} catch( error1 ) {
						reject( error1 );
					}

				}
			}
		} );
	}

	private logout(): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {
			try {

				await this.actions.Logout();

				resolve( true );
			} catch( error ) {
				this.events.emit( eAMI_EVENTS.ERROR_LOGOUT, error );
				reject( "Failed to logout" );

			}
		} );
	}

	private showSendPackages(): void {
		setInterval( () => {

			console.log( "Keep Connection. success sent - %s, error sent - %s", this._successBitsByInterval, this._errorBitsByInterval );
			//this._successBitsByInterval = this._errorBitsByInterval = 0;

		}, 5000 );
	}

	public connect(): Promise<this | boolean> {
		return new Promise( ( resolve, reject ) => {

			this._socketHandler = new Socket();
			this._socketHandler.connect( this._port, this._host );

			this._socketHandler
				.on( 'connect', async () => {
					this.addSocketListeners();

					try {

						if( this.debug ) console.log( "connection to the server" );
						await this.login();

						this._isLoggedIn = true;
						this._lastConnectedTime = new Date().getTime();

						if( this.debug ) this.showSendPackages();
						await this.keepConnection();

						this.events.emit( eAMI_EVENTS.CONNECT );

						resolve( this );

					} catch( error ) {
						if( this.debug ) console.log( error );
						reject( error );
					}

				} )
				.on( 'error', ( error ) => {
					this.events.emit( eAMI_EVENTS.ERROR_CONNECT, error, "Error connecting to an asterisk server" );
					if( this.debug ) console.log( "Error connecting to an asterisk server", error );
					reject( false );
				} );

			//console.log(this._socketHandler);

		} );
	}

	public reconnect(): Promise<boolean> {
		if( !this._reconnect ) return Promise.resolve( true );
		if( this._countReconnect < this._maxReconnectCount ) this._countReconnect++;
		else {
			this.events.emit( eAMI_EVENTS.MAX_RECONNECT_REACH, this._countReconnect );
			return;
		}

		return new Promise( async ( resolve, reject ) => {

			try {
				this.events.emit( eAMI_EVENTS.DO_RECONNECT );

				await this.logout();
				this.destroySocket();
				await this.connect();

				this.events.emit( eAMI_EVENTS.RECONNECTED );
				resolve( true );

			} catch( error ) {
				this.events.emit( eAMI_EVENTS.ERROR_RECONNECT, error, "Could not connect to Asterisk..." );
				reject( "Could not connect to Asterisk..." );
			}

		} );
	}

	public action<T, R>( request: T ): Promise<R> {
		return new Promise( ( resolve, reject ) => {

			let write: boolean,
				writed: boolean = false,
				message = "";

			for( let key in request ) {
				if( key == "ActionID" ) continue;
				message += key + ": " + request[ key ] + CRLF;
			}

			if( _isUndefined( request[ "ActionID" ] ) ) request[ "ActionID" ] = new Date().getTime();
			let actionID = request[ "ActionID" ];

			message += "ActionID: " + actionID + CRLF + CRLF;

			//handlers for resolve
			this.events.once( `Action_${actionID}`, ( response: R ) => {
				_request[ "Completed" ] = true;

				if( this.debug ) console.log( "response", _request[ "ActionID" ], _request[ "Action" ], );

				resolve( response );
			} );
			if( !_isFinite( _toNumber( actionID ) ) ) {
				this.events.once( actionID, ( response: R ) => {
					_request[ "Completed" ] = true;
					resolve( response );

				} );
			}

			this.addRequest( request );
			let _request = this.getRequest( actionID );

			_request[ "ActionID" ] = _isFinite( _toNumber( request[ "ActionID" ] ) ) ? _toNumber( request[ "ActionID" ] ) : request[ "ActionID" ];
			_request[ "Completed" ] = false;
			_request[ "timeOutHandler" ] = setTimeout( async () => {
				if( !writed ) {
					reject( "Timeout write to socket..." );
					return;
				}

				if( !_request[ "Completed" ] ) {

					try {
						await this.action( request );
					} catch( error ) {
						if( this.debug ) console.log( "Error resend action", _request[ "Action" ], error );
						reject( "Error resend action" + _request[ "Action" ] + error );
					}

					this._errorBitsByInterval++;
					if( this.debug ) console.log( "resend ActionID_" + actionID, _request[ "Action" ] );
					return;
				}

				clearTimeout( request[ "timeOutHandler" ] );
				this.removeRequest( actionID );
				this.events.removeAllListeners( actionID );
				this.events.removeAllListeners( `Action_${actionID}` );
				if( this.debug ) console.log( "complete " + actionID, _request[ "Action" ] );


			}, 3000 );


			write = this._socketHandler.write( message, () => {
				writed = true;
			} );

			if( write === false ) {
				if( this.debug ) console.log( "Data in the sending queue" );
				reject( "Data in the sending queue" );
			}
		} );
	}

	private getData( buffer: BufferSource ): I_Response {

		let dataStr: string = buffer.toString(),
			iDelim: number,
			typeResponse: string = "",
			dataArray: string[] = [],
			keyValueArray: string[],
			key: string = "",
			value: any = null,
			dataObject: I_Response;

		if( dataStr.substr( 0, 21 ) == "Asterisk Call Manager" )
			dataStr = dataStr.substr( dataStr.indexOf( CRLF ) + 2 ); // skip the server greeting when first connecting

		while( ( iDelim = dataStr.indexOf( END ) ) >= 0 ) {
			dataArray = dataStr.substring( 0, iDelim + 2 ).split( CRLF );
			dataStr = dataStr.substr( iDelim + 4 );
			dataObject = {};
			typeResponse = "";
			keyValueArray = [];

			for( let index = 0; index < dataArray.length; index++ ) {
				if( dataArray[ index ].indexOf( ": " ) < 0 ) continue;

				keyValueArray = dataArray[ index ].split( ": ", 2 );
				key = keyValueArray[ 0 ].replace( "'", "" );
				value = keyValueArray[ 1 ];
				typeResponse = index == 0 ? key.toLowerCase() : typeResponse;

				if( key === "ActionID" ) {
					dataObject[ key ] = value;
					dataObject[ key ] = _isFinite( _toNumber( dataObject[ key ] ) ) ? _toNumber( dataObject[ key ] ) : dataObject[ key ];
					continue;
				}

				if( _isFinite( _toNumber( value ) ) )
					value = _toNumber( value );
				else if( value.indexOf( "unknown" ) >= 0 )
					value = null;
				else if( _isEmpty( value ) )
					value = null;
				else if( value.toLowerCase().indexOf( "s" ) === 0 && value.toString().length === 1 )
					value = null;

				dataObject[ key ] = value;
			}


			let request = this.getRequest( dataObject.ActionID );

			dataObject.Request = typeof request !== "boolean" ? request : null;

			if( _isFinite( _toNumber( dataObject.ActionID ) ) )
				this.events.emit( "Action_" + dataObject.ActionID, dataObject );
			else if( typeof dataObject.ActionID == "string" )
				this.events.emit( dataObject.ActionID, dataObject );

			switch( typeResponse ) {
				case "response":
					if( this.debug ) console.log( eAMI_EVENTS.RESPONSE, CRLF, dataObject, CRLF );

					this.events.emit( eAMI_EVENTS.RESPONSE, dataObject );

					break;
				case "event":
					if( this.debug ) console.log( eAMI_EVENTS.EVENTS, CRLF, dataObject, CRLF );

					if( this.excludeEvents.indexOf( dataObject.Event ) < 0 ) {

						if( this._emitAllEvents ) this.events.emit( eAMI_EVENTS.EVENTS, dataObject );

						this.events.emit( dataObject.Event, dataObject );

					}

					break;

				default:

					break;
			}
		}

		return dataObject;
	}

}