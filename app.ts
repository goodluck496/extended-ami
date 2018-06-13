/*
*
* Asterisk manager for Asterisk versions 12, 13, 14, 15
*
* */

'use strict';

import { Socket } from "net";
import { EventEmitter } from "events";
import { isEmpty, isFinite, isUndefined, toNumber } from "./functions";
import { connectionOptions } from "./interfaces/configure.interface";
import {
	I_ActionLogin, I_ActionLogout, I_ActionPing, I_ActionStatus, I_Request,
	I_Response,
} from "./interfaces/actions.interface";
import {
	AMI_EVENTS,
	CRLF,
	END,
	HEARTBEAT_INTERVAL,
	HEARTBEAT_TIMEOUT,
	TIMEOUT_FOR_SEND,
	TIMEOUT_TO_DEFIBRILLATION,
} from "./constants";
import Timer = NodeJS.Timer;
import { I_Status } from "./interfaces/status.interface";

export class eAmi {
	public debug: boolean;
	private _isConnectedAsterisk: boolean;

	private _host: string;
	private _port: number;
	private _userName: string;
	private _password: string;

	private _reconnect: boolean;
	private _heartbeatOk: boolean;
	private _heartbeatInterval: number;
	private _heartbeatHandler: Timer;
	private _timeOutSend: number;
	private _heartbeatTimeout: number;
	private _timeOutToDefibrillation: number;
	private _countPreDefibrillation: number;
	private _eventsByActionID: boolean;
	private _eventsByOnlyActionID: boolean;
	private _resendAction: boolean;

	private _socketHandler: Socket;
	private _excludeEvents: string[];
	private _actions: any;

	public events: EventEmitter;


	constructor( allOptions: connectionOptions ) {

		let connect = allOptions,
			options = connect.additionalOption;

		this._host = connect.host;
		this._port = connect.port;
		this._userName = connect.userName;
		this._password = connect.password;

		this._reconnect = isUndefined( options.reconnect ) ? true : options.reconnect;

		this._heartbeatInterval = isUndefined( options.heartbeatInterval ) ? HEARTBEAT_INTERVAL * 1000 : options.heartbeatInterval * 1000;

		this.excludeEvents = isUndefined( options.excludeEvents ) || isEmpty( options.excludeEvents ) ? [] : options.excludeEvents;

		this._timeOutSend = isUndefined( options.timeOutSend ) ? TIMEOUT_FOR_SEND : options.timeOutSend;

		this._eventsByActionID = isUndefined( options.eventsByActionID ) ? false : options.eventsByActionID;

		if( isUndefined( options.eventsByOnlyActionID ) ) this._eventsByOnlyActionID = false;
		else {
			this._eventsByActionID = true;
			this._eventsByOnlyActionID = options.eventsByOnlyActionID;
		}

		this._resendAction = isUndefined( options.resendAction ) ? false : options.resendAction;
		this.debug = isUndefined( options.debug ) ? false : options.debug;
		this._timeOutToDefibrillation = isUndefined( options.timeOutToDefibrillation ) ?
			TIMEOUT_TO_DEFIBRILLATION : options.timeOutToDefibrillation;

		this._heartbeatTimeout = HEARTBEAT_TIMEOUT;

		this._countPreDefibrillation = 0;
		this.events = new EventEmitter();
		this._actions = {};

		this._isConnectedAsterisk = false;

		this.addInternalListeners();

	}

	get actions() {
		return this._actions;
	}

	set actionsItem( request: I_Request | any ) {
		this._actions[ request.ActionID ] = request;
	}

	get excludeEvents() {
		return this._excludeEvents;
	}

	set excludeEvents( events: string[] ) {
		this._excludeEvents = events;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	public isConnected(): boolean {
		return this._isConnectedAsterisk
	}

	private addInternalListeners(): void {
		this.events
			.on( "ping", () => { this._heartbeatOk = true; } );
	}

	private addSocketListeners(): void {
		this._socketHandler
			.on( "close", () => { if( this.debug ) console.log( "close AMI connect" ); } )
			.on( "end", () => { if( this.debug ) console.log( "end AMI connect" );} )
			.on( "data", ( buffer: Buffer ) => this.getData( buffer ) );
	}

	private destroySocket(): void {
		this._socketHandler.destroy();
		if( this.debug ) console.log( CRLF + "Socket connection destroyed" );
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

				await this.action<I_ActionPing>( {
					Action: "Ping",
				} );
				resolve( true );

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

						await this.keepConnection();
					} else {
						if( this.debug ) console.log( "Keep connection failed [timeout ping]" );
						this._countPreDefibrillation = 0;

						this._isConnectedAsterisk = false;


						await this.reconnect();

					}

				}, this._heartbeatInterval );


			} catch( error ) {

				if( this.debug ) console.log( "Keep connection failed [send ping]", error );
				if( this._reconnect ) {
					await this.reconnect();
					reject( false );

				}

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

				await this.action<I_ActionLogin>( {
					Action: "Login",
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

				await this.action<I_ActionLogout>( {
					Action: "Logoff",
				} );

				resolve( true );
			} catch( error ) {
				reject( "Failed to logout" );
			}
		} );
	}

	/**
	 *
	 * @param {Buffer} buffer
	 * @returns {I_Response}
	 */
	private getData( buffer: Buffer ): I_Response {

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


			if( this._eventsByActionID ) {

				dataObject.Request = this.actions[ dataObject.ActionID ];

				if( isFinite( toNumber( dataObject.ActionID ) ) )
					this.events.emit( "Action_" + dataObject.ActionID, dataObject );
				else if( typeof dataObject.ActionID == "string" )
					this.events.emit( dataObject.ActionID, dataObject );

				if( this._eventsByOnlyActionID && !isUndefined( this.actions[ dataObject.ActionID ] ) ) return;

			}

			switch( typeResponse ) {
				case "response":
					if( this.debug ) console.log( dataObject );

					if( !isUndefined( dataObject.Ping ) ) {
						this.events.emit( "ping" );

						if( !this.debug ) return;
					}

					this.events.emit( "response", dataObject );

					break;
				case "event" :

					this.events.emit("event", dataObject);

					if( this.excludeEvents.indexOf( dataObject.Event ) < 0 ) {
						this.events.emit( dataObject.Event, dataObject );
						if( this.debug ) console.log( CRLF + CRLF, dataObject, CRLF );
					}

					break;

				default:
					break;
			}
		}

		return dataObject;
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
						await this.login();

						this._isConnectedAsterisk = true;

						await this.keepConnection();

						this.events.emit( "connect" );

						resolve( this );

					} catch( error ) {
						reject( false );
					}

				} )
				.on( 'error', ( error ) => {
					this.events.emit("error", error );
					if( this.debug ) console.log( "ERROR", error );
					reject( false );
				} );

		} );
	}

	/**
	 *
	 * @returns {Promise<boolean>}
	 */
	public reconnect(): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {

			try {
				this.events.emit("disconnect");
				await this.logout();
				this.destroySocket();
				await this.connect();
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

			this.actionsItem = request;

			for( let key in request ) {
				if( key == "ActionID" ) continue;
				message += key + ": " + request[ key ] + CRLF;
			}

			message += "ActionID: " + request[ "ActionID" ] + CRLF + CRLF;

			let writed: boolean = false,
				second: number = 0,
				write = this._socketHandler.write( message, () => {
					writed = true;
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
}
