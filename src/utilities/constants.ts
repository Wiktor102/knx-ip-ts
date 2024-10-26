// Common constants
export const HEADER_SIZE_10 = 0x06;
export const KNXNETIP_VERSION_10 = 0x10;

// Timeout constants (seconds)
export const SEARCH_TIMEOUT = 10;
export const CONNECT_REQUEST_TIMEOUT = 10;
export const CONNECTIONSTATE_REQUEST_TIMEOUT = 10;
export const DEVICE_CONFIGURATION_REQUEST_TIMEOUT = 10;
export const TUNNELING_REQUEST_TIMEOUT = 1;
export const CONNECTION_ALIVE_TIME = 120;

// Common error constants
export const E_NO_ERROR = 0x00;
export const E_HOST_PROTOCOL_TYPE = 0x01;
export const E_VERSION_NOT_SUPPORTED = 0x02;
export const E_SEQUENCE_NUMBER = 0x04;

// Connect response errors
export const E_CONNECTION_TYPE = 0x22;
export const E_CONNECTION_OPTION = 0x23;
export const E_NO_MORE_CONNECTIONS = 0x24;

// ConnectionState response errors
export const E_CONNECTION_ID = 0x21;
export const E_DATA_CONNECTION = 0x26;
export const E_KNX_CONNECTION = 0x27;

// ConnectACK response errors
export const E_TUNNELING_LAYER = 0x29;

export const SEARCH_REQUEST = 0x0201;
export const SEARCH_RESPONSE = 0x0202;
export const SEARCH_REQUEST_EXT = 0x020b;
export const SEARCH_RESPONSE_EXT = 0x020c;
export const DESCRIPTION_REQUEST = 0x0203;
export const DESCRIPTION_RESPONSE = 0x0204;
export const CONNECT_REQUEST = 0x0205;
export const CONNECT_RESPONSE = 0x0206;
export const CONNECTIONSTATE_REQUEST = 0x0207;
export const CONNECTIONSTATE_RESPONSE = 0x0208;
export const DISCONNECT_REQUEST = 0x0209;
export const DISCONNECT_RESPONSE = 0x020a;
export const TUNNELLING_REQUEST = 0x0420;
export const TUNNELLING_ACK = 0x0421;

// Host protocol constants
export const IPV4_UDP = 0x01;
export const IPV4_TCP = 0x02;

// cEMI service constants
export const L_BUSMON_IND = 0x2b;
export const L_DATA_REQ = 0x11;
export const L_DATA_CON = 0x2e;
export const L_DATA_IND = 0x29;
export const L_RAW_REQ = 0x10;
export const L_RAW_IND = 0x1d;
export const L_RAW_CON = 0x2f;
export const L_POLL_DATA_REQ = 0x13;
export const L_POLL_DATA_CON = 0x25;
export const T_DATA_CONNECTED_REQ = 0x41;
export const T_DATA_CONNECTED_IND = 0x89;
export const T_DATA_INDIVIDUAL_REQ = 0x4a;
export const T_DATA_INDIVIDUAL_IND = 0x94;
