/*
*
* Asterisk manager for Asterisk versions 12, 13, 14, 15
*
* */

'use strict';

import { Socket } from "net";
import { EventEmitter } from "events";
import { indexOfArray, isEmpty, isFinite, isNull, isUndefined, toNumber } from "./functions";
import { connectionOptions } from "./interfaces/configure.interface";
import { I_Request, I_Response, } from "./interfaces/actions.interface";
import {
	CRLF, DEFAULT_PORT,
	END,
	HEARTBEAT_INTERVAL,
	HEARTBEAT_TIMEOUT, MAX_RECONNECT_COUNT,
	TIMEOUT_FOR_SEND,
	TIMEOUT_TO_DEFIBRILLATION,
} from "./constants";
import { eAmiActions } from "./e-ami-actions";


export class eAmi {
	public debug: boolean;

	private _isLoggedIn: boolean;
	private _lastConnectedTime: number;

	private _host: string;
	private _port: number;
	private _userName: string;
	private _password: string;

	private _emitAllEvents: boolean;
	private _maxReconnectCount: number;
	private _reconnect: boolean;
	private _heartbeatInterval: number;
	private _timeOutSend: number;
	private _timeOutToDefibrillation: number;
	private _resendAction: boolean;

	private _heartbeatOk: boolean;

	private _heartbeatHandler: number;
	private _heartbeatTimeout: number;

	private _countPreDefibrillation: number;
	private _countReconnect: number;

	private _socketHandler: Socket;
	private _excludeEvents: string[];

	private _queueRequest: I_Request[];

	public _actions: eAmiActions;

	private _events: EventEmitter;

	constructor( allOptions: connectionOptions ) {

		let connect = allOptions,
			options = connect.additionalOptions;

		this._host = connect.host;
		this._port =  isNull(connect.port) ? DEFAULT_PORT : connect.port;
		this._userName = connect.userName;
		this._password = connect.password;

		this._reconnect = isUndefined( options.reconnect ) ? true : options.reconnect;

		this._heartbeatInterval = isUndefined( options.heartbeatInterval ) ? HEARTBEAT_INTERVAL * 1000 : options.heartbeatInterval * 1000;

		this.excludeEvents = isUndefined( options.excludeEvents ) || isEmpty( options.excludeEvents ) ? [] : options.excludeEvents;

		this._timeOutSend = isUndefined( options.timeOutSend ) ? TIMEOUT_FOR_SEND : options.timeOutSend;

		this._resendAction = isUndefined( options.resendAction ) ? false : options.resendAction;

		this._emitAllEvents = isUndefined( options.emitAllEvents ) ? false : options.emitAllEvents;

		this.debug = isUndefined( options.debug ) ? false : options.debug;

		this._timeOutToDefibrillation = isUndefined( options.timeOutToDefibrillation ) ?
			TIMEOUT_TO_DEFIBRILLATION : options.timeOutToDefibrillation;

		this._heartbeatTimeout = HEARTBEAT_TIMEOUT;

		this._maxReconnectCount = isUndefined(options.maxReconnectCount) ? MAX_RECONNECT_COUNT : options.maxReconnectCount;

		this._countPreDefibrillation = 0;
		this._countReconnect = 0;

		this._events = new EventEmitter();

		this._queueRequest = [];

		this._isLoggedIn = false;

		this._actions = new eAmiActions( this );

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

	get actions(){
		return this._actions;
	}

	get events(){
		return this._events;
	}

	get queueRequest(){
		return this._queueRequest;
	}

	private addSocketListeners(): void {
		this._socketHandler
			.on( "close", () => { if( this.debug ) console.log( "close AMI connect" ); } )
			.on( "end", () => { if( this.debug ) console.log( "end AMI connect" );} )
			.on( "data", ( buffer: BufferSource ) => this.getData( buffer ) );
	}

	private destroySocket(): void {
		this._socketHandler.destroy();
		if( this.debug ) console.log( CRLF + "Socket connection destroyed" );
	}

	/**
	 *
	 * @param {I_Request} request
	 */
	private addRequest( request: I_Request ): void {
		this.queueRequest.push( request );
	}

	/**
	 *
	 * @param actionID
	 * @returns {boolean}
	 */
	removeRequest( actionID: any ): boolean {
		if(isUndefined(actionID)) return false;

		let index: number = indexOfArray( this.queueRequest, actionID );

		if( index < 0 ) return false;
		try {
			this.queueRequest.splice( index, 1 );
			return true;
		} catch( error ) {
			if( this.debug ) console.log( "Error remove request", error );
			return false;
		}

	}

	/**
	 *
	 * @param actionID
	 * @returns {I_Request | boolean}
	 */
	getRequest( actionID: any ): I_Request | boolean {
		if(isUndefined(actionID)) return false;

		let index: number = indexOfArray( this.queueRequest, actionID );

		if( index < 0 ) return false;

		return this.queueRequest[ index ];

	}

	/**
	 *
	 * @param actionID
	 * @param {I_Request} newRequest
	 */
	private setRequest( actionID: any, newRequest: I_Request ): void {
		let request = this.getRequest( actionID );

		if( request === false ) return;

		request = newRequest;
	}

	/**
	 *
	 * @returns {Promise<boolean>}
	 */
	private keepConnection(): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {

			clearInterval( this._heartbeatHandler );
			let countRetrySend = 0;

			try {

				let ping: boolean = await this.actions.Ping();

				if( ping ) {
					this._heartbeatOk = true;
					resolve( true );
				} else reject( false );


				this._heartbeatHandler = setInterval( async () => {
					if( this._heartbeatOk ) {
						this._heartbeatOk = false;
						this._countPreDefibrillation = 0;
						await this.keepConnection();

					} else if( countRetrySend < this._heartbeatTimeout ) {
						countRetrySend++;
						if( this.debug ) console.log( "Timeout received - %d, count to reconnect - %d", countRetrySend, this._timeOutToDefibrillation - this._countPreDefibrillation );
					} else if( this._countPreDefibrillation < this._timeOutToDefibrillation ) {
						this._countPreDefibrillation++;
						if( this.debug ) console.log( "Timeout received exceeded..." );

						try {
							await this.keepConnection();
						} catch( error ) {
							console.log( "KeepAlive message did not reach, ... resend" );
							await this.keepConnection();
						}


					} else {
						if( this.debug ) console.log( "Keep connection failed [timeout ping]" );
						this._countPreDefibrillation = 0;

						this._isLoggedIn = false;

						try {
							await this.reconnect();
						} catch( error ) {
							console.log( error );
							console.log( "Error while restoring connection, reconnect after %s seconds..", this._timeOutToDefibrillation );
							setTimeout( () => {
								this.reconnect();
							}, this._timeOutToDefibrillation * 1000 );
						}

					}

				}, this._heartbeatInterval );


			} catch( error ) {
				if( this.debug ) console.log( "Keep connection failed [send ping]", error );

				reject( false );
			}
		} );
	}

	/**
	 *
	 * @returns {Promise<boolean>}
	 */
	private login(): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {
			try {

				await this.actions.Login( {
					Username: this._userName,
					Secret: this._password,
				} );

				resolve( true );
			} catch( error ) {
				reject( "Authorization failed" );
			}
		} );
	}

	/**
	 *
	 * @returns {Promise<boolean>}
	 */
	private logout(): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {
			try {

				await this.actions.Logout();

				resolve( true );
			} catch( error ) {
				reject( "Failed to logout" );
			}
		} );
	}

	/**
	 *
	 * @returns {Promise<this | boolean>} false - only error
	 */
	public connect(): Promise<this | boolean> {
		return new Promise( ( resolve, reject ) => {

			this._socketHandler = new Socket();
			this._socketHandler.connect( this._port, this._host );

			this._socketHandler
				.on( 'connect', async () => {
					this.addSocketListeners();

					try {

						if( this.debug ) console.log( "connection to the server");
						await this.login();

						this._isLoggedIn = true;
						this._lastConnectedTime = new Date().getTime();

						await this.keepConnection();

						this.events.emit( "connect" );

						resolve( this );

					} catch( error ) {
						if( this.debug ) console.log( error );
						reject( false );
					}

				} )
				.on( 'error', ( error ) => {
					this.events.emit( "error", error );
					if( this.debug ) console.log( "Error connecting to an asterisk server", error );
					reject( false );
				} );

			//console.log(this._socketHandler);

		} );
	}

	/**
	 *
	 * @returns {Promise<boolean>}
	 */
	public reconnect(): Promise<boolean> {
		if( !this._reconnect ) return;
		if( this._countReconnect < this._maxReconnectCount) this._countReconnect++;
		else throw "Maximum number of reconnections reached";

		return new Promise( async ( resolve, reject ) => {


			try {
				this.events.emit( "disconnect" );

				await this.logout();
				this.destroySocket();
				await this.connect();

				this.events.emit( "reconnected" );

			} catch( error ) {
				reject( "Could not connect to Asterisk..." );
			}

		} );
	}

	/**
	 *
	 * @param {T} request ** {T} = I_Action<SomeAction>
	 * @returns {Promise<boolean | T>} false - timeOut or error
	 */
	public action<T>( request: T ): Promise<T | boolean> {
		return new Promise( ( resolve, reject ) => {

			let message = "";

			for( let key in request ) {
				if( key == "ActionID" ) continue;
				message += key + ": " + request[ key ] + CRLF;
			}

			if( isUndefined( request[ "ActionID" ] ) ) request[ "ActionID" ] = new Date().getTime();

			message += "ActionID: " + request[ "ActionID" ] + CRLF + CRLF;

			let writed: boolean = false,
				second: number = 0,
				write = this._socketHandler.write( message, () => {
					writed = true;
					this.addRequest( request );
					resolve( request );
				} ),

				intervalTimeout = setInterval( () => {
					if( writed ) {
						resolve( request );
						clearInterval( intervalTimeout );
					} else if( second <= this._timeOutSend ) {
						second++;
					} else {
						if( this._resendAction ) {
							if( this.debug ) console.log( "Resend Action - ", request[ "Action" ] );
							this.action<T>( request );
						} else {
							if( this.debug ) console.log( "Delay in sending a message" );
							reject( false );
							clearInterval( intervalTimeout );
						}

					}

				}, 1000 );

			if( write === false ) {
				if( this.debug ) console.log( "Data in the sending queue" );
				reject( false );
			}
		} );
	}

	/**
	 *
	 * @param {Buffer} buffer
	 * @returns {I_Response}
	 */
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
					continue;
				}

				if( isFinite( toNumber( value ) ) )
					value = toNumber( value );
				else if( value.indexOf( "unknown" ) >= 0 )
					value = null;
				else if( isEmpty( value ) )
					value = null;
				else if( value.toLowerCase().indexOf( "s" ) === 0 && value.toString().length === 1 )
					value = null;

				dataObject[ key ] = value;
			}


			let request = this.getRequest( dataObject.ActionID );
			dataObject.Request = typeof request !== "boolean" ? request : null;

			if( isFinite( toNumber( dataObject.ActionID ) ) )
				this.events.emit( "Action_" + dataObject.ActionID, dataObject );
			else if( typeof dataObject.ActionID == "string" )
				this.events.emit( dataObject.ActionID, dataObject );

			this.removeRequest( dataObject.ActionID );

			switch( typeResponse ) {
				case "response":
					if( this.debug ) console.log( "response", CRLF + dataObject, CRLF  );

					this.events.emit( "response", dataObject );

					break;
				case "event" :
					if( this.debug ) console.log("event", CRLF + dataObject, CRLF );

					if( this.excludeEvents.indexOf( dataObject.Event ) < 0 ) {

						if( this._emitAllEvents ) this.events.emit( "events", dataObject );

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