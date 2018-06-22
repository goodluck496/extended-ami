import { AMI_EVENTS, eAmi } from "./e-ami";
import {
	I_ActionBridgeInfo,
	I_ActionBridgeList,
	I_ActionCoreShowChannels,
	I_ActionHangup,
	I_ActionLogin,
	I_ActionLogout,
	I_ActionOriginate,
	I_ActionPing,
	I_ActionQueueAdd,
	I_ActionQueuePause,
	I_ActionQueuePenalty,
	I_ActionQueueRemove,
	I_ActionQueueStatus,
	I_ActionQueueSummary,
	I_ActionStatus,
	I_Response,
} from "./interfaces/actions.interface";
import { _AMI_EVENTS } from "./constants";
import { I_Status } from "./interfaces/status.interface";
import { _isNull, _isUndefined } from "./functions";
import {
	I_QueueMember,
	I_QueueMemberAdded,
	I_QueueMemberPause,
	I_QueueMemberPenalty,
	I_QueueMemberRemoved,
	I_QueueParams,
	I_QueueSummary,
} from "./interfaces/queue";

import { I_DualHangup, I_Hangup, I_HangupRequest } from "./interfaces/hangup.interface";
import { I_BridgeInfoChannel, I_BridgeListComplete, I_BridgeListItem } from "./interfaces/bridge.interface";
import { I_CoreShowChannel, I_CoreShowChannelsComplete } from "./interfaces/core-interface";
import { I_OriginateResponse } from "./interfaces/originate.interface";

export class eAmiActions {

	private eAmi: eAmi;

	constructor( eAmi: eAmi ) {
		this.eAmi = eAmi;
	}

	public BridgeInfo( options: I_ActionBridgeInfo ): Promise<I_BridgeInfoChannel> {
		return new Promise( async ( resolve, reject ) => {

			options.Action = "BridgeInfo";
			options.ActionID = new Date().getTime();

			this.eAmi.events.on( _AMI_EVENTS.BRIDGE_INFO_CHANNEL, ( response: I_BridgeInfoChannel ) => resolve( response ) );

			try {

				await this.eAmi.action<I_ActionBridgeInfo, I_BridgeInfoChannel>( options );

			} catch( error ) {
				reject( error );
			}


		} );
	}

	public BridgeList( options: I_ActionBridgeList ): Promise<I_BridgeListItem[]> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "BridgeList";
			options.ActionID = new Date().getTime();

			let bridgeItemsCount: number = 0,
				bridgeItems: I_BridgeListItem[] = [];

			this.eAmi.events.once( _AMI_EVENTS.BRIDGE_LIST_COMPLETE, ( response: I_BridgeListComplete ) => {
				bridgeItemsCount = response.ListItems;

				if( bridgeItemsCount == bridgeItems.length ) resolve( bridgeItems );

			} );

			this.eAmi.events.on( _AMI_EVENTS.BRIDGE_LIST_ITEM, ( response: I_BridgeListItem ) => {
				bridgeItems.push( response );

				if( bridgeItemsCount == bridgeItems.length ) resolve( bridgeItems );

			} );

			try {

				await this.eAmi.action<I_ActionBridgeList, I_BridgeListComplete>( options );

			} catch( error ) {
				reject( error );
			}
		} );
	}

	public CoreShowChannels( options: I_ActionCoreShowChannels ): Promise<I_CoreShowChannel[]> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "CoreShowChannels";

			let channelsCount: number = 0,
				channels: I_CoreShowChannel[] = [];

			this.eAmi.events.once( _AMI_EVENTS.CORE_SHOW_CHANNEL_COMPLETE, ( response: I_CoreShowChannelsComplete ) => {
				channelsCount = response.ListItems;

				if( channels.length == channelsCount ) resolve( channels );

			} );

			this.eAmi.events.on( _AMI_EVENTS.CORE_SHOW_CHANNEL, ( response: I_CoreShowChannel ) => {
				channels.push( response );

				if( channels.length == channelsCount ) resolve( channels );
			} );

			try {

				await this.eAmi.action<I_ActionCoreShowChannels, I_CoreShowChannelsComplete>( options );

			} catch( error ) {
				reject( error );
			}
		} );
	}

	public Hangup( options: I_ActionHangup ): Promise<I_DualHangup> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "Hangup";

			let hangup: I_DualHangup = { hangup: null, hangupRequest: null };

			this.eAmi.events.once( _AMI_EVENTS.HANGUP, ( h: I_Hangup ) => {
				hangup.hangup = h;
				if( !_isNull( hangup.hangupRequest ) ) resolve( hangup );
			} );

			this.eAmi.events.once( _AMI_EVENTS.HANGUP_REQUEST, ( hr: I_HangupRequest ) => {
				hangup.hangupRequest = hr;
				if( !_isNull( hangup.hangup ) ) resolve( hangup );
			} );

			try {

				await this.eAmi.action<I_ActionHangup, I_Response>( options );

			} catch( error ) {
				reject( error );
			}
		} );
	}

	public Login( options: I_ActionLogin ): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "Login";
			options.ActionID = new Date().getTime();

			try {

				let response = await this.eAmi.action<I_ActionLogin, I_Response>( options );

				if( response.Response == "Success" ) resolve( true );
				else if(response.Response == "Error") reject( response );
				else resolve(true);


			} catch( error ) {
				console.log( "ERROR LOGIN", error );
				reject( error );
			}

		} );
	}

	public Logout(): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {
			let actionId = new Date().getTime();

			this.eAmi.events.once( `Action_${actionId}`, ( response ) => {
				if( this.eAmi.debug ) console.log( "logout-response", response );
				if( _isUndefined( response.Response ) ) reject( false );
				if( response.Response == "Goodbye" ) resolve( true );
				else reject( false );
			} );

			try {

				await this.eAmi.action<I_ActionLogout, I_Response>( {
					Action: "Logoff",
					ActionID: actionId,
				} );

			} catch( error ) {
				reject( error );
			}

		} );
	}

	public Originate( options: I_ActionOriginate ): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "Originate";
			options.ActionID = new Date().getTime();

			this.eAmi.events.once( "Action_" + options.ActionID, ( response: any ) => {
				if( _isUndefined( response.Message ) ) reject( false );
				if( response.Message.toString().toLowerCase().indexOf( "failed" ) >= 0 ) reject( false );

				resolve( true );
			} );

			// not working
			// this.eAmi.events.once(_AMI_EVENTS.ORIGINATE_RESPONSE, (response: I_OriginateResponse) => resolve(response));

			try {

				await this.eAmi.action<I_ActionOriginate, I_OriginateResponse>( options );

			} catch( error ) {
				reject( error );
			}
		} );
	}

	public Ping(): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {

			let actionID = new Date().getTime();

			try {

				let response = await this.eAmi.action<I_ActionPing, I_Response>( {
					Action: "Ping",
					ActionID: actionID,
				} );

				if( response.Response == "Success" ) resolve( true );
				else if( response.Request.Completed === true ) resolve( true );
				else if( response.Request.Completed === false ) reject( response );

			} catch( error ) {
				reject( error );
			}

		} );
	}

	public QueueMemberAdd( options: I_ActionQueueAdd ): Promise<I_QueueMemberAdded> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "QueueAdd";

			this.eAmi.events.once( _AMI_EVENTS.Q_MEMBER_ADDED, ( response: I_QueueMemberAdded ) => resolve( response ) );

			try {

				await this.eAmi.action<I_ActionQueueAdd, I_QueueMemberAdded>( options );

			} catch( error ) {
				reject( error );
			}
		} );
	}

	public QueueMemberRemove( options: I_ActionQueueRemove ): Promise<I_QueueMemberRemoved> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "QueueRemove";

			this.eAmi.events.once( _AMI_EVENTS.Q_MEMBER_REMOVED, ( response: I_QueueMemberRemoved ) => resolve( response ) );

			try {

				await this.eAmi.action<I_ActionQueueRemove, I_QueueMemberRemoved>( options );

			} catch( error ) {
				reject( error );
			}
		} );
	}

	public QueueMemberPenalty( options: I_ActionQueuePenalty ): Promise<I_QueueMemberPenalty> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "QueuePenalty";

			this.eAmi.events.once( _AMI_EVENTS.Q_MEMBER_PENALTY, ( response: I_QueueMemberPenalty ) => resolve( response ) );

			try {

				await this.eAmi.action<I_ActionQueuePenalty, I_QueueMemberPenalty>( options );

			} catch( error ) {
				reject( error );
			}
		} );
	}

	public QueueMemberPause( options: I_ActionQueuePause ): Promise<I_QueueMemberPause> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "QueuePause";

			this.eAmi.events.once( _AMI_EVENTS.Q_MEMBER_PAUSE, ( response: I_QueueMemberPause ) => resolve( response ) );

			try {

				await this.eAmi.action<I_ActionQueuePause, I_QueueMemberPause>( options );

			} catch( error ) {
				reject( error );
			}
		} );
	}

	public QueueStatus( options: I_ActionQueueStatus ): Promise<I_QueueMember[]> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "QueueStatus";

			let summary: I_QueueSummary = await this.QueueSummary( { Queue: options.Queue } ),
				countMembers: number = summary.Available + summary.Callers + summary.LoggedIn,
				members: I_QueueMember[] = [];

			this.eAmi.events.on( _AMI_EVENTS.Q_MEMBER, ( response: I_QueueMember ) => {
				members.push( response );

				if( members.length == countMembers ) {
					this.eAmi.events.removeAllListeners( _AMI_EVENTS.Q_MEMBER );
					resolve( members );
				}
			} );

			try {

				let response = await this.eAmi.action<I_ActionQueueStatus, I_QueueParams>( options );
				this.eAmi.events.emit( AMI_EVENTS.Q_PARAMS, response );

			} catch( error ) {
				reject( error );
			}
		} );
	}

	public QueueSummary( options: I_ActionQueueSummary ): Promise<I_QueueSummary> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "QueueSummary";

			this.eAmi.events.once( _AMI_EVENTS.Q_SUMMARY, ( response: I_QueueSummary ) => {
				resolve( response )
			} );

			try {

				await this.eAmi.action<I_ActionQueueSummary, I_Response>( options );

			} catch( error ) {
				reject( error );
			}
		} );
	}

	public Status( options: I_ActionStatus ): Promise<I_Status> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "Status";
			options.ActionID = new Date().getTime();

			this.eAmi.events.once( _AMI_EVENTS.STATUS, ( response: I_Status ) => resolve( response ) );

			try {

				await this.eAmi.action<I_ActionStatus, I_Response>( options );

			} catch( error ) {
				reject( error );
			}
		} );
	}
}
