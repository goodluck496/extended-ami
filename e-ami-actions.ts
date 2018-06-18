import { eAmi } from "./e-ami";
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
} from "./interfaces/actions.interface";
import { AMI_EVENTS } from "./constants";
import { I_Status } from "./interfaces/status.interface";
import { isNull, isUndefined } from "./functions";
import {
	I_QueueMember,
	I_QueueMemberAdded,
	I_QueueMemberPause,
	I_QueueMemberPenalty,
	I_QueueMemberRemoved,
	I_QueueSummary,
} from "./interfaces/queue";

import { I_DualHangup, I_Hangup, I_HangupRequest } from "./interfaces/hangup.interface";
import { I_BridgeInfoChannel, I_BridgeListComplete, I_BridgeListItem } from "./interfaces/bridge.interface";
import { I_CoreShowChannel, I_CoreShowChannelsComplete } from "./interfaces/core-interface";

export class eAmiActions {

	private eAmi: eAmi;

	constructor( eAmi: eAmi ) {
		this.eAmi = eAmi;
	}

	/**
	 *
	 * @param {I_ActionBridgeInfo} options
	 * @returns {Promise<I_BridgeInfoChannel>}
	 * @constructor
	 */
	public BridgeInfo( options: I_ActionBridgeInfo ): Promise<I_BridgeInfoChannel> {
		return new Promise( async ( resolve, reject ) => {

			options.Action = "BridgeInfo";
			options.ActionID = new Date().getTime();

			this.eAmi.events.on( AMI_EVENTS.BRIDGE_INFO_CHANNEL, ( response: I_BridgeInfoChannel ) => resolve( response ) );

			try {

				await this.eAmi.action<I_ActionBridgeInfo>( options );

			} catch( error ) {
				reject( false );
				console.log( error );
			}


		} );
	}

	/**
	 *
	 * @param {I_ActionBridgeList} options
	 * @returns {Promise<I_BridgeListItem[]>}
	 * @constructor
	 */
	public BridgeList( options: I_ActionBridgeList ): Promise<I_BridgeListItem[]> {
		return new Promise( async ( resolve, reject ) => {
			if( isUndefined( options ) ) reject( false );

			options.Action = "BridgeList";
			options.ActionID = new Date().getTime();

			let bridgeItemsCount: number = 0,
				bridgeItems: I_BridgeListItem[] = [];

			this.eAmi.events.once( AMI_EVENTS.BRIDGE_LIST_COMPLETE, ( response: I_BridgeListComplete ) => {
				bridgeItemsCount = response.ListItems;

				if( bridgeItemsCount == bridgeItems.length ) resolve( bridgeItems );

			} );

			this.eAmi.events.on( AMI_EVENTS.BRIDGE_LIST_ITEM, ( response: I_BridgeListItem ) => {
				bridgeItems.push( response );

				if( bridgeItemsCount == bridgeItems.length ) resolve( bridgeItems );

			} );

			try {

				await this.eAmi.action<I_ActionBridgeList>( options );

			} catch( error ) {
				reject( false );
			}
		} );
	}

	/**
	 *
	 * @param {I_ActionCoreShowChannels} options
	 * @returns {Promise<I_CoreShowChannel[]>}
	 * @constructor
	 */
	public CoreShowChannels( options: I_ActionCoreShowChannels ): Promise<I_CoreShowChannel[]> {
		return new Promise( async ( resolve, reject ) => {
			if( isUndefined( options ) ) reject( false );

			options.Action = "CoreShowChannels";

			let channelsCount: number = 0,
				channels: I_CoreShowChannel[] = [];

			this.eAmi.events.once( AMI_EVENTS.CORE_SHOW_CHANNEL_COMPLETE, ( response: I_CoreShowChannelsComplete ) => {
				channelsCount = response.ListItems;

				if( channels.length == channelsCount ) resolve( channels );

			} );

			this.eAmi.events.on( AMI_EVENTS.CORE_SHOW_CHANNEL, ( response: I_CoreShowChannel ) => {
				channels.push( response );

				if( channels.length == channelsCount ) resolve( channels );
			} );

			try {

				await this.eAmi.action<I_ActionCoreShowChannels>( options );

			} catch( error ) {
				reject( false );
			}
		} );
	}

	/**
	 *
	 * @param {I_ActionHangup} options
	 * @returns {Promise<I_DualHangup>}
	 * @constructor
	 */
	public Hangup( options: I_ActionHangup ): Promise<I_DualHangup> {
		return new Promise( async ( resolve, reject ) => {
			if( isUndefined( options ) ) reject( false );

			options.Action = "Hangup";

			let hangup: I_DualHangup = { hangup: null, hangupRequest: null };

			this.eAmi.events.once( AMI_EVENTS.HANGUP, ( h: I_Hangup ) => {
				hangup.hangup = h;
				if( !isNull( hangup.hangupRequest ) ) resolve( hangup );
			} );

			this.eAmi.events.once( AMI_EVENTS.HANGUP_REQUEST, ( hr: I_HangupRequest ) => {
				hangup.hangupRequest = hr;
				if( !isNull( hangup.hangup ) ) resolve( hangup );
			} );

			try {

				await this.eAmi.action<I_ActionHangup>( options );

			} catch( error ) {
				reject( false );
			}
		} );
	}

	/**
	 *
	 * @param {I_ActionLogin} options
	 * @returns {Promise<boolean>}
	 * @constructor
	 */
	public Login( options: I_ActionLogin ): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {
			if( isUndefined( options ) ) reject( false );

			options.Action = "Login";
			options.ActionID = new Date().getTime();


			this.eAmi.events.once( `Action_${options.ActionID}`, ( response ) => {
				if( isUndefined( response.Response ) ) reject( false );
				if( response.Response == "Success" ) resolve( true );
				else reject( false );
			} );

			try {

				await this.eAmi.action<I_ActionLogin>( options );

			} catch( error ) {
				reject( false );
			}

		} );
	}

	/**
	 *
	 * @returns {Promise<boolean>}
	 * @constructor
	 */
	public Logout(): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {
			let actionId = new Date().getTime();

			this.eAmi.events.once( `Action_${actionId}`, ( response ) => {
				if( isUndefined( response.Response ) ) reject( false );
				if( response.Response == "Goodbye" ) resolve( true );
				else reject( false );
			} );

			try {

				await this.eAmi.action<I_ActionLogout>( {
					Action: "Logoff",
					ActionID: actionId,
				} );

			} catch( error ) {
				reject( false );
			}

		} );
	}

	/**
	 *
	 * @param {I_ActionOriginate} options
	 * @returns {Promise<boolean>}
	 * @constructor
	 */
	public Originate( options: I_ActionOriginate ): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {
			if( isUndefined( options ) ) reject( false );

			options.Action = "Originate";
			options.ActionID = new Date().getTime();

			this.eAmi.events.once( "Action_" + options.ActionID, ( response: any ) => {
				if( isUndefined( response.Message ) ) reject( false );
				if( response.Message.toString().toLowerCase().indexOf( "failed" ) >= 0 ) reject( false );

				resolve( true );
			} );

			// not working
			// this.eAmi.events.once(AMI_EVENTS.ORIGINATE_RESPONSE, (response: I_OriginateResponse) => resolve(response));

			try {

				await this.eAmi.action<I_ActionOriginate>( options );

			} catch( error ) {
				reject( false );
			}
		} );
	}

	/**
	 *
	 * @returns {Promise<boolean>}
	 * @constructor
	 */
	public Ping(): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {

			let actionID = new Date().getTime();

			this.eAmi.events.once( `Action_${actionID}`, ( response ) => resolve( true ) );

			try {

				await this.eAmi.action<I_ActionPing>( {
					Action: "Ping",
					ActionID: actionID,
				} );

			} catch( error ) {
				reject( false );
			}

		} );
	}

	/**
	 *
	 * @param {I_ActionQueueAdd} options
	 * @returns {Promise<I_QueueMemberAdded>}
	 * @constructor
	 */
	public QueueMemberAdd( options: I_ActionQueueAdd ): Promise<I_QueueMemberAdded> {
		return new Promise( async ( resolve, reject ) => {
			if( isUndefined( options ) ) reject( false );

			options.Action = "QueueAdd";

			this.eAmi.events.once( AMI_EVENTS.Q_MEMBER_ADDED, ( response: I_QueueMemberAdded ) => resolve( response ) );

			try {

				await this.eAmi.action<I_ActionQueueAdd>( options );

			} catch( error ) {
				reject( false );
			}
		} );
	}

	/**
	 *
	 * @param {I_ActionQueueRemove} options
	 * @returns {Promise<I_QueueMemberRemoved>}
	 * @constructor
	 */
	public QueueMemberRemove( options: I_ActionQueueRemove ): Promise<I_QueueMemberRemoved> {
		return new Promise( async ( resolve, reject ) => {
			if( isUndefined( options ) ) reject( false );

			options.Action = "QueueRemove";

			this.eAmi.events.once( AMI_EVENTS.Q_MEMBER_REMOVED, ( response: I_QueueMemberRemoved ) => resolve( response ) );

			try {

				await this.eAmi.action<I_ActionQueueRemove>( options );

			} catch( error ) {
				reject( false );
			}
		} );
	}

	/**
	 *
	 * @param {I_ActionQueuePenalty} options
	 * @returns {Promise<I_QueueMemberPenalty>}
	 * @constructor
	 */
	public QueueMemberPenalty( options: I_ActionQueuePenalty ): Promise<I_QueueMemberPenalty> {
		return new Promise( async ( resolve, reject ) => {
			if( isUndefined( options ) ) reject( false );

			options.Action = "QueuePenalty";

			this.eAmi.events.once( AMI_EVENTS.Q_MEMBER_PENALTY, ( response: I_QueueMemberPenalty ) => resolve( response ) );

			try {

				await this.eAmi.action<I_ActionQueuePenalty>( options );

			} catch( error ) {
				reject( false );
			}
		} );
	}

	/**
	 *
	 * @param {I_ActionQueuePause} options
	 * @returns {Promise<I_QueueMemberPause>}
	 * @constructor
	 */
	public QueueMemberPause( options: I_ActionQueuePause ): Promise<I_QueueMemberPause> {
		return new Promise( async ( resolve, reject ) => {
			if( isUndefined( options ) ) reject( false );

			options.Action = "QueuePause";

			this.eAmi.events.once( AMI_EVENTS.Q_MEMBER_PAUSE, ( response: I_QueueMemberPause ) => resolve( response ) );

			try {

				await this.eAmi.action<I_ActionQueuePause>( options );

			} catch( error ) {
				reject( false );
			}
		} );
	}

	/**
	 *
	 * @param {I_ActionQueueStatus} options
	 * @returns {Promise<I_QueueMember[]>}
	 * @constructor
	 */
	public QueueStatus( options: I_ActionQueueStatus ): Promise<I_QueueMember[]> {
		return new Promise( async ( resolve, reject ) => {
			if( isUndefined( options ) ) reject( false );

			options.Action = "QueueStatus";

			let summary: I_QueueSummary = await this.QueueSummary( { Queue: options.Queue } ),
				countMembers: number = summary.Available + summary.Callers + summary.LoggedIn,
				members: I_QueueMember[] = [];

			this.eAmi.events.on( AMI_EVENTS.Q_MEMBER, ( response: I_QueueMember ) => {
				members.push( response );

				if( members.length == countMembers ) {
					this.eAmi.events.removeAllListeners( AMI_EVENTS.Q_MEMBER );
					resolve( members );
				}
			} );

			try {

				await this.eAmi.action<I_ActionQueueStatus>( options );

			} catch( error ) {
				reject( false );
			}
		} );
	}

	/**
	 *
	 * @param {I_ActionQueueSummary} options
	 * @returns {Promise<I_QueueSummary>}
	 * @constructor
	 */
	public QueueSummary( options: I_ActionQueueSummary ): Promise<I_QueueSummary> {
		return new Promise( async ( resolve, reject ) => {
			if( isUndefined( options ) ) reject( false );

			options.Action = "QueueSummary";

			this.eAmi.events.once( AMI_EVENTS.Q_SUMMARY, ( response: I_QueueSummary ) => resolve( response ) );

			try {

				await this.eAmi.action<I_ActionQueueSummary>( options );

			} catch( error ) {
				reject( false );
			}
		} );
	}

	/**
	 *
	 * @param {I_ActionStatus} options
	 * @returns {Promise<I_Status>}
	 * @constructor
	 */
	public Status( options: I_ActionStatus ): Promise<I_Status> {
		return new Promise( async ( resolve, reject ) => {
			if( isUndefined( options ) ) reject( false );

			options.Action = "Status";

			this.eAmi.events.once( AMI_EVENTS.STATUS, ( response: I_Status ) => resolve( response ) );

			try {

				await this.eAmi.action<I_ActionStatus>( options );

			} catch( error ) {
				reject( false );
			}
		} );
	}
}
