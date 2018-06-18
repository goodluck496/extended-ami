export interface connectionOptions {
	host: string
	port: number
	userName: string
	password: string

	additionalOptions: IAddinionalOptions
}
export interface IAddinionalOptions {

	//Output messages to the console
	debug?: boolean
	//Delay before resending a command (in seconds)
	timeOutSend?: number
	//resend message on after timeout
	resendAction?: boolean
	//reconnect after timeout defibrillation
	reconnect?: boolean
	maxReconnectCount?: number
	emitAllEvents?: boolean
	// in seconds
	timeOutToDefibrillation?: number

	//ping command frequency
	heartbeatInterval?: number

	//list of excluded events
	excludeEvents?: string[]
}