export interface connectionOptions {
	host: string
	port: number
	userName: string
	password: string

	additionalOption: IAddinionalOptions
}
export interface IAddinionalOptions {

	//Output messages to the console
	debug?: boolean
	//generate events by ActionID
	eventsByActionID?: boolean
	//generate events by ONLY ActionID
	eventsByOnlyActionID?: boolean
	//Delay before resending a command (in seconds)
	timeOutSend?: number
	//resend message on after timeout
	resendAction?: boolean
	//reconnect after timeout defibrillation
	reconnect?: boolean
	// in seconds
	timeOutToDefibrillation?: number

	//ping command frequency
	heartbeatInterval?: number

	//list of excluded events
	excludeEvents?: string[]
}