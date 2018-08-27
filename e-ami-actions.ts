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

export class eAmiActions {

	private eAmi: eAmi;
	private timeOutAction: number;

	constructor( eAmi: eAmi ) {
		this.eAmi = eAmi;
		this.timeOutAction = 5000;
	}

	public BridgeInfo( options: I_ActionBridgeInfo ): Promise<I_BridgeInfoChannel> {
		return new Promise( async ( resolve, reject ) => {

			options.Action = "BridgeInfo";
			options.ActionID = new Date().getTime();

			let removeListener = () => {
					this.eAmi.events.removeListener( AMI_EVENTS.BRIDGE_INFO_CHANNEL, onBRIDGE_INFO_CHANNEL );
				},
				onBRIDGE_INFO_CHANNEL = ( response: I_BridgeInfoChannel ) => {
					resolve( response );
					removeListener();
				};

			this.eAmi.events.once( AMI_EVENTS.BRIDGE_INFO_CHANNEL, onBRIDGE_INFO_CHANNEL );

			setTimeout( () => {
				reject( "Timeout to '" + options.Action + "' action, try again later..." );
			}, this.timeOutAction );

			try {

				let response = await this.eAmi.action<I_ActionBridgeInfo, I_Response>( options );
				if( !_isUndefined( response.Response ) ) {
					if( response.Response.toLowerCase() == "error" ) {
						reject( response );
						removeListener();
					}
				}

			} catch( error ) {
				reject( error );
				removeListener();
			}


		} );
	}

	public BridgeList( options: I_ActionBridgeList ): Promise<I_BridgeListItem[]> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "BridgeList";
			options.ActionID = new Date().getTime();

			let bridgeItemsCount: number = 0,
				bridgeItems: I_BridgeListItem[] = [],
				removeListener = () => {
					this.eAmi.events.removeListener( AMI_EVENTS.BRIDGE_LIST_COMPLETE, onBRIDGE_LIST_COMPLETE );
					this.eAmi.events.removeListener( AMI_EVENTS.BRIDGE_LIST_ITEM, onBRIDGE_LIST_ITEM );
				},
				onBRIDGE_LIST_ITEM = ( response: I_BridgeListItem ) => {
					bridgeItems.push( response );

					if( bridgeItemsCount == bridgeItems.length ) {
						resolve( bridgeItems );
						removeListener();
					}

				},
				onBRIDGE_LIST_COMPLETE = ( response: I_BridgeListComplete ) => {
					bridgeItemsCount = response.ListItems;

					if( bridgeItemsCount == bridgeItems.length ) {
						resolve( bridgeItems );
						removeListener();
					}
				};


			this.eAmi.events.once( AMI_EVENTS.BRIDGE_LIST_COMPLETE, onBRIDGE_LIST_COMPLETE );
			this.eAmi.events.on( AMI_EVENTS.BRIDGE_LIST_ITEM, onBRIDGE_LIST_ITEM );

			setTimeout( () => {
				reject( "Timeout to '" + options.Action + "' action, try again later..." );
			}, this.timeOutAction );

			try {

				let response = await this.eAmi.action<I_ActionBridgeList, I_Response>( options );
				if( !_isUndefined( response.Response ) ) {
					if( response.Response.toLowerCase() == "error" ) {
						reject( response );
						removeListener();
					}
				}

			} catch( error ) {
				reject( error );
				removeListener();
			}
		} );
	}

	public CoreShowChannels( options: I_ActionCoreShowChannels ): Promise<I_CoreShowChannel[]> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "CoreShowChannels";

			let channelsCount: number = 0,
				channels: I_CoreShowChannel[] = [],
				removeListener = () => {
					this.eAmi.events.removeListener( AMI_EVENTS.CORE_SHOW_CHANNEL, onCORE_SHOW_CHANNEL );
					this.eAmi.events.removeListener( AMI_EVENTS.CORE_SHOW_CHANNEL_COMPLETE, onCORE_SHOW_CHANNEL_COMPLETE );
				},
				onCORE_SHOW_CHANNEL = ( response: I_CoreShowChannel ) => {

					channels.push( response );

					if( channels.length == channelsCount ) {
						resolve( channels );
						removeListener();
					}

				},
				onCORE_SHOW_CHANNEL_COMPLETE = ( response: I_CoreShowChannelsComplete ) => {
					channelsCount = response.ListItems;

					if( channels.length == channelsCount ) {
						resolve( channels );
						removeListener();
					}
				};

			this.eAmi.events.once( AMI_EVENTS.CORE_SHOW_CHANNEL_COMPLETE, onCORE_SHOW_CHANNEL_COMPLETE );
			this.eAmi.events.on( AMI_EVENTS.CORE_SHOW_CHANNEL, onCORE_SHOW_CHANNEL );

			setTimeout( () => {
				reject( "Timeout to '" + options.Action + "' action, try again later..." );
			}, this.timeOutAction );

			try {

				let response = await this.eAmi.action<I_ActionCoreShowChannels, I_Response>( options );
				if( !_isUndefined( response.Response ) ) {
					if( response.Response.toLowerCase() == "error" ) {
						reject( response );
						removeListener();
					}
				}

			} catch( error ) {
				reject( error );
				removeListener();
			}
		} );
	}

	public Hangup( options: I_ActionHangup ): Promise<I_DualHangup> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "Hangup";

			let hangup: I_DualHangup = { hangup: null, hangupRequest: null },
				removeListeners = () => {
					this.eAmi.events.removeListener( AMI_EVENTS.HANGUP, onHANGUP );
					this.eAmi.events.removeListener( AMI_EVENTS.HANGUP_REQUEST, onHANGUP_REQUEST );
				},
				onHANGUP = ( h: I_Hangup ) => {
					hangup.hangup = h;
					if( !_isNull( hangup.hangupRequest ) ) resolve( hangup );
					removeListeners();
				},
				onHANGUP_REQUEST = ( hr: I_HangupRequest ) => {
					hangup.hangupRequest = hr;
					if( !_isNull( hangup.hangup ) ) resolve( hangup );
					removeListeners();
				};

			this.eAmi.events.once( AMI_EVENTS.HANGUP, onHANGUP );
			this.eAmi.events.once( AMI_EVENTS.HANGUP_REQUEST, onHANGUP_REQUEST );

			setTimeout( () => {
				reject( "Timeout to '" + options.Action + "' action, try again later..." );
			}, this.timeOutAction );

			try {

				let response = await this.eAmi.action<I_ActionHangup, I_Response>( options );
				if( !_isUndefined( response.Response ) ) {
					if( response.Response.toLowerCase() == "error" ) {
						reject( response );
						removeListeners();
					}
				}

			} catch( error ) {
				reject( error );
				removeListeners();
			}
		} );
	}

	public Login( options: I_ActionLogin ): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "Login";
			options.ActionID = new Date().getTime();

			setTimeout( () => {
				reject( "Timeout to '" + options.Action + "' action, try again later..." );
			}, this.timeOutAction );

			try {

				let response = await this.eAmi.action<I_ActionLogin, I_Response>( options );

				if( response.Response == "Success" ) resolve( true );
				else if( response.Response == "Error" ) reject( response );
				else resolve( true );

			} catch( error ) {
				console.log( "ERROR LOGIN", error );
				reject( error );
			}

		} );
	}

	public Logout(): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {
			let actionId = new Date().getTime();

			setTimeout( () => {
				reject( "Timeout to 'Logoff' action, try again later..." );
			}, this.timeOutAction );

			try {

				let response = await this.eAmi.action<I_ActionLogout, I_Response>( {
					Action: "Logoff",
					ActionID: actionId,
				} );

				if( this.eAmi.debug ) console.log( "logout-response", response );
				if( _isUndefined( response.Response ) ) reject( response );
				if( response.Response == "Goodbye" ) resolve( true );
				else reject( response );

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

			let removeListener = () => {
					this.eAmi.events.removeListener( "Action_" + options.ActionID, onActionID );
				},
				onActionID = ( response: any ) => {
					if( _isUndefined( response.Message ) ) reject( false );
					if( response.Message.toString().toLowerCase().indexOf( "failed" ) >= 0 ) reject( false );
					resolve( true );

					removeListener();
				};

			this.eAmi.events.once( "Action_" + options.ActionID, onActionID );

			// not working
			// this.eAmi.events.once(AMI_EVENTS.ORIGINATE_RESPONSE, (response: I_OriginateResponse) => resolve(response));

			setTimeout( () => {
				reject( "Timeout to '" + options.Action + "' action, try again later..." );
			}, this.timeOutAction );

			try {

				let response = await this.eAmi.action<I_ActionOriginate, I_Response>( options );
				if( !_isUndefined( response.Response ) ) {
					if( response.Response.toLowerCase() == "error" ) {
						reject( response );
						removeListener();
					}
				}

			} catch( error ) {
				reject( error );
				removeListener();
			}
		} );
	}

	public Ping(): Promise<boolean> {
		return new Promise( async ( resolve, reject ) => {

			let actionID = new Date().getTime();

			setTimeout( () => {
				reject( "Timeout to 'Ping' action, try again later..." );
			}, this.timeOutAction );

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

			let removeListener = () => {
					this.eAmi.events.removeListener( AMI_EVENTS.Q_MEMBER_ADDED, onQ_MEMBER_ADDED );
				},
				onQ_MEMBER_ADDED = ( response: I_QueueMemberAdded ) => {
					resolve( response );
					removeListener();
				};

			this.eAmi.events.once( AMI_EVENTS.Q_MEMBER_ADDED, onQ_MEMBER_ADDED );

			setTimeout( () => {
				reject( "Timeout to '" + options.Action + "' action, try again later..." );
			}, this.timeOutAction );

			try {

				let response = await this.eAmi.action<I_ActionQueueAdd, I_Response>( options );
				if( !_isUndefined( response.Response ) ) {
					if( response.Response.toLowerCase() == "error" ) {
						reject( response );
						removeListener();
					}
				}

			} catch( error ) {
				reject( error );
				removeListener();
			}
		} );
	}

	public QueueMemberRemove( options: I_ActionQueueRemove ): Promise<I_QueueMemberRemoved> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "QueueRemove";

			let removeListener = () => {
					this.eAmi.events.removeListener( AMI_EVENTS.Q_MEMBER_REMOVED, onQ_MEMBER_REMOVED );
				},
				onQ_MEMBER_REMOVED = ( response: I_QueueMemberRemoved ) => {
					resolve( response );
					removeListener();
				};

			this.eAmi.events.once( AMI_EVENTS.Q_MEMBER_REMOVED, onQ_MEMBER_REMOVED );

			setTimeout( () => {
				reject( "Timeout to '" + options.Action + "' action, try again later..." );
			}, this.timeOutAction );

			try {

				let response = await this.eAmi.action<I_ActionQueueRemove, I_Response>( options );
				if( !_isUndefined( response.Response ) ) {
					if( response.Response.toLowerCase() == "error" ) {
						removeListener();
						reject( response );
					}
				}


			} catch( error ) {
				reject( error );
				removeListener();
			}
		} );
	}

	public QueueMemberPenalty( options: I_ActionQueuePenalty ): Promise<I_QueueMemberPenalty> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "QueuePenalty";

			let removeListener = () => {
					this.eAmi.events.removeListener( AMI_EVENTS.Q_MEMBER_PENALTY, onQ_MEMBER_PENALTY );
				},
				onQ_MEMBER_PENALTY = ( response: I_QueueMemberPenalty ) => {
					resolve( response );
					removeListener();
				};

			this.eAmi.events.once( AMI_EVENTS.Q_MEMBER_PENALTY, onQ_MEMBER_PENALTY );

			setTimeout( () => {
				reject( "Timeout to '" + options.Action + "' action, try again later..." );
			}, this.timeOutAction );

			try {

				let response = await this.eAmi.action<I_ActionQueuePenalty, I_Response>( options );
				if( !_isUndefined( response.Response ) ) {
					if( response.Response.toLowerCase() == "error" ) {
						reject( response );
						removeListener();
					}
				}

			} catch( error ) {
				reject( error );
				removeListener();
			}
		} );
	}

	public QueueMemberPause( options: I_ActionQueuePause ): Promise<I_QueueMemberPause> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "QueuePause";

			let removeListener = () => {
					this.eAmi.events.removeListener( AMI_EVENTS.Q_MEMBER_PAUSE, onQ_MEMBER_PAUSE );
				},
				onQ_MEMBER_PAUSE = ( response: I_QueueMemberPause ) => {
					resolve( response );
					removeListener();
				};

			this.eAmi.events.once( AMI_EVENTS.Q_MEMBER_PAUSE, onQ_MEMBER_PAUSE );

			setTimeout( () => {
				reject( "Timeout to '" + options.Action + "' action, try again later..." );
			}, this.timeOutAction );

			try {

				let response = await this.eAmi.action<I_ActionQueuePause, I_Response>( options );
				if( !_isUndefined( response.Response ) ) {
					if( response.Response.toLowerCase() == "error" ) {
						reject( response );
						removeListener();
					}
				}

			} catch( error ) {
				reject( error );
				removeListener();
			}
		} );
	}

	public QueueStatus( options: I_ActionQueueStatus ): Promise<I_QueueMember[]> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "QueueStatus";

			let members: I_QueueMember[] = [],
				countMembers: number = 0,
				removeListener = () => {
					this.eAmi.events.removeListener( AMI_EVENTS.Q_MEMBER, onQ_MEMBER );
				},
				onQ_MEMBER = ( response: I_QueueMember ) => {
					members.push( response );

					if( members.length == countMembers ) {
						resolve( members );
						removeListener();
					}
				};

			this.eAmi.events.on( AMI_EVENTS.Q_MEMBER, onQ_MEMBER );

			setTimeout( () => {
				reject( "Timeout to '" + options.Action + "' action, try again later..." );
				removeListener();
				this.QueueStatus(options);
			}, this.timeOutAction );

			try {

				let summary: I_QueueSummary = await this.QueueSummary( { Queue: options.Queue } );
				countMembers = summary.Available + summary.Callers + summary.LoggedIn;

				if( !_isUndefined( options.MembersCount ) ) {
					countMembers = countMembers == options.MembersCount ? countMembers : options.MembersCount;
				}

				if( this.eAmi.debug ) console.log( "Count queue members: available - %s, Callers - %s, LoggedIn - %s. Need count - %s",
					summary.Available, summary.Callers, summary.LoggedIn, _isUndefined( options.MembersCount ) ? null : options.MembersCount );

				let response = await this.eAmi.action<I_ActionQueueStatus, I_QueueParams>( options );
				if( !_isUndefined( response[ "Response" ] ) ) {
					if( response[ "Response" ].toLowerCase() == "error" ) {
						reject( response );
						removeListener();
					}
				} else {
					this.eAmi.events.emit( AMI_EVENTS.Q_PARAMS, response );
					removeListener();
				}

			} catch( error ) {
				reject( error );
				removeListener();
			}
		} );
	}

	public QueueSummary( options: I_ActionQueueSummary ): Promise<I_QueueSummary> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "QueueSummary";

			let removeListener = () => {
					this.eAmi.events.removeListener( AMI_EVENTS.Q_SUMMARY, onQ_SUMMARY );
				},
				onQ_SUMMARY = ( response: I_QueueSummary ) => {
					resolve( response );
					removeListener();
				};

			this.eAmi.events.once( AMI_EVENTS.Q_SUMMARY, onQ_SUMMARY );

			setTimeout( () => {
				reject( "Timeout to '" + options.Action + "' action, try again later..." );
			}, this.timeOutAction );

			try {

				let response = await this.eAmi.action<I_ActionQueueSummary, I_Response>( options );
				if( !_isUndefined( response.Response ) ) {
					if( response.Response.toLowerCase() == "error" ) {
						reject( response );
						removeListener();
					}
				}

			} catch( error ) {
				reject( error );
				removeListener();
			}
		} );
	}

	public Status( options: I_ActionStatus ): Promise<I_Status> {
		return new Promise( async ( resolve, reject ) => {
			if( _isUndefined( options ) ) reject( false );

			options.Action = "Status";
			options.ActionID = new Date().getTime();

			let removeListener = () => {
					this.eAmi.events.removeListener( AMI_EVENTS.STATUS, onSTATUS );
				},
				onSTATUS = ( response: I_Status ) => {
					resolve( response );
					removeListener();
				};
			this.eAmi.events.once( AMI_EVENTS.STATUS, onSTATUS );

			setTimeout( () => {
				reject( "Timeout to '" + options.Action + "' action, try again later..." );
			}, this.timeOutAction );

			try {
				let response = await this.eAmi.action<I_ActionStatus, I_Response>( options );
				if( !_isUndefined( response.Response ) ) {
					if( response.Response.toLowerCase() == "error" ) {
						reject( response );
						removeListener();
					}
				}

			} catch( error ) {
				reject( error );
				removeListener();
			}
		} );
	}
}
