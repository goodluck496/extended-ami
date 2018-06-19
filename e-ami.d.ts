import { connectionOptions } from "./interfaces/configure.interface";
import {
	I_ActionBridgeInfo,
	I_ActionBridgeList,
	I_ActionCoreShowChannels,
	I_ActionHangup,
	I_ActionLogin,
	I_ActionOriginate,
	I_ActionQueueAdd,
	I_ActionQueuePause,
	I_ActionQueuePenalty,
	I_ActionQueueRemove,
	I_ActionQueueStatus,
	I_ActionQueueSummary,
	I_ActionStatus,
	I_Request,
	I_Response,
} from "./interfaces/actions.interface";
import { Socket } from "net";
import { EventEmitter } from "events";
import { I_BridgeInfoChannel, I_BridgeListItem } from "./interfaces/bridge.interface";
import { I_CoreShowChannel } from "./interfaces/core-interface";
import { I_DualHangup } from "./interfaces/hangup.interface";
import {
	I_QueueMember,
	I_QueueMemberAdded,
	I_QueueMemberPause,
	I_QueueMemberPenalty,
	I_QueueMemberRemoved,
	I_QueueSummary,
} from "./interfaces/queue";
import { I_Status } from "./interfaces/status.interface";

declare namespace extended_ami {

	/**
	 *
	 * @param value
	 * @returns {boolean}
	 */
	function _isUndefined( value: any ): boolean;

	/**
	 *
	 * @param value
	 * @returns {boolean}
	 */
	function _isNull( value: any ): boolean;

	/**
	 *
	 * @param value
	 * @returns {boolean}
	 */
	function _isEmpty( value: any ): boolean;

	/**
	 *
	 * @param value
	 * @returns {boolean}
	 */
	function _isNaN( value: any ): boolean;

	/**
	 *
	 * @param value
	 * @returns {boolean}
	 */
	function _isNumber( value: any ): boolean;

	/**
	 *
	 * @param value
	 * @returns {number}
	 */
	function _toNumber( value: any ): number;

	/**
	 *
	 * @param value
	 * @returns {boolean}
	 */
	function _isFinite( value: any ): boolean;

	/**
	 *
	 * @param {any[]} array
	 * @param value
	 * @returns {number index or -1 for error}
	 */
	function _indexOfArray( array: any[], value: any ): number;

	class eAmi {
		constructor( options: connectionOptions );

		public debug: boolean;

		private _host: string;
		private _port: number;
		private _userName: string;
		private _password: string;

		private _isLoggedIn: boolean;
		private _emitAllEvents: boolean;
		private _reconnect: boolean;
		private _resendAction: boolean;
		private _heartbeatOk: boolean;

		private _lastConnectedTime: number;
		private _maxReconnectCount: number;
		private _heartbeatInterval: number;
		private _timeOutSend: number;
		private _timeOutToDefibrillation: number;
		private _heartbeatHandler: number;
		private _heartbeatTimeout: number;
		private _countPreDefibrillation: number;
		private _countReconnect: number;

		private _excludeEvents: string[];

		private _queueRequest: I_Request[];
		private _socketHandler: Socket;
		private _actions: eAmiActions;
		private _events: EventEmitter;

		/**
		 * 
		 * Getters
		 */
		public excludeEvents: string[];
		public isLoggedIn: boolean;
		public lastConnectTime: number
		public actions: eAmiActions
		public events: EventEmitter
		public queueRequest: I_Request[]
		
		
		private destroySocket(): void;

		/**
		 *
		 * @param {I_Request} request
		 */
		private addRequest( request: I_Request ): void;

		/**
		 *
		 * @param actionID
		 * @returns {boolean}
		 */
		public removeRequest( actionID: any ): boolean;

		/**
		 *
		 * @param actionID
		 * @returns {I_Request | boolean}
		 */
		public getRequest( actionID: any ): I_Request | boolean;

		/**
		 *
		 * @param actionID
		 * @param {I_Request} newRequest
		 */
		private setRequest( actionID: any, newRequest: I_Request ): void;

		/**
		 *
		 * @returns {Promise<boolean>}
		 */
		private keepConnection(): Promise<boolean>;

		/**
		 *
		 * @returns {Promise<boolean>}
		 */
		private login(): Promise<boolean>;

		/**
		 *
		 * @returns {Promise<boolean>}
		 */
		private logout(): Promise<boolean>;

		/**
		 *
		 * @returns {Promise<this | boolean>} false - only error
		 */
		public connect(): Promise<boolean | this>;

		/**
		 *
		 * @returns {Promise<boolean>}
		 */
		public reconnect(): Promise<boolean>;

		/**
		 *
		 * @param {T} request ** {T} = I_Action<SomeAction>
		 * @returns {Promise<boolean | T>} false - timeOut or error
		 */
		public action<T>( request: T ): Promise<T | boolean>;

		/**
		 *
		 * @param {Buffer} buffer
		 * @returns {I_Response}
		 */
		private getData( buffer: BufferSource ): I_Response;

	}

	class eAmiActions {

		private eAmi: eAmi;

		constructor( eAmi: eAmi );

		/**
		 *
		 * @param {I_ActionBridgeInfo} options
		 * @returns {Promise<I_BridgeInfoChannel>}
		 */
		public BridgeInfo( options: I_ActionBridgeInfo ): Promise<I_BridgeInfoChannel>;

		/**
		 *
		 * @param {I_ActionBridgeList} options
		 * @returns {Promise<I_BridgeListItem[]>}
		 */
		public BridgeList( options: I_ActionBridgeList ): Promise<I_BridgeListItem[]>;

		/**
		 *
		 * @param {I_ActionCoreShowChannels} options
		 * @returns {Promise<I_CoreShowChannel[]>}
		 */
		public CoreShowChannels( options: I_ActionCoreShowChannels ): Promise<I_CoreShowChannel[]>;

		/**
		 *
		 * @param {I_ActionHangup} options
		 * @returns {Promise<I_DualHangup>}
		 */
		public Hangup( options: I_ActionHangup ): Promise<I_DualHangup>;

		/**
		 *
		 * @param {I_ActionLogin} options
		 * @returns {Promise<boolean>}
		 */
		public Login( options: I_ActionLogin ): Promise<boolean>;

		/**
		 *
		 * @returns {Promise<boolean>}
		 */
		public Logout(): Promise<boolean>;

		/**
		 *
		 * @param {I_ActionOriginate} options
		 * @returns {Promise<boolean>}
		 */
		public Originate( options: I_ActionOriginate ): Promise<boolean>;

		/**
		 *
		 * @returns {Promise<boolean>}
		 */
		public Ping(): Promise<boolean>;

		/**
		 *
		 * @param {I_ActionQueueAdd} options
		 * @returns {Promise<I_QueueMemberAdded>}
		 */
		public QueueMemberAdd( options: I_ActionQueueAdd ): Promise<I_QueueMemberAdded>;

		/**
		 *
		 * @param {I_ActionQueueRemove} options
		 * @returns {Promise<I_QueueMemberRemoved>}
		 */
		public QueueMemberRemove( options: I_ActionQueueRemove ): Promise<I_QueueMemberRemoved>;

		/**
		 *
		 * @param {I_ActionQueuePenalty} options
		 * @returns {Promise<I_QueueMemberPenalty>}
		 */
		public QueueMemberPenalty( options: I_ActionQueuePenalty ): Promise<I_QueueMemberPenalty>;

		/**
		 *
		 * @param {I_ActionQueuePause} options
		 * @returns {Promise<I_QueueMemberPause>}
		 */
		public QueueMemberPause( options: I_ActionQueuePause ): Promise<I_QueueMemberPause>;

		/**
		 *
		 * @param {I_ActionQueueStatus} options
		 * @returns {Promise<I_QueueMember[]>}
		 */
		public QueueStatus( options: I_ActionQueueStatus ): Promise<I_QueueMember[]>;

		/**
		 *
		 * @param {I_ActionQueueSummary} options
		 * @returns {Promise<I_QueueSummary>}
		 */
		public QueueSummary( options: I_ActionQueueSummary ): Promise<I_QueueSummary>;

		/**
		 *
		 * @param {I_ActionStatus} options
		 * @returns {Promise<I_Status>}
		 */
		public Status( options: I_ActionStatus ): Promise<I_Status>;
	}
}

export = extended_ami;