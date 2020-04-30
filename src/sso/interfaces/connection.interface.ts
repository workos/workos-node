import { ConnectionType } from './connection-type.enum';

export interface ConnectionDomain {
  object: 'connection_domain';
  id: string;
  domain: string;
}

export interface Connection {
  object: 'connection';
  id: string;
  status: 'linked' | 'unlinked';
  name: string;
  connection_type: ConnectionType;
  oauth_uid: string;
  oauth_secret: string;
  oauth_redirect_uri: string;
  saml_entity_id: string;
  saml_idp_url: string;
  saml_relying_party_trust_cert: string;
  saml_x509_certs: string;
  domains: ConnectionDomain[];
}
