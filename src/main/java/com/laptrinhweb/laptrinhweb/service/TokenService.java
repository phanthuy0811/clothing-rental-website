package com.laptrinhweb.laptrinhweb.service;

import com.laptrinhweb.laptrinhweb.dto.request.IntrospectRequest;
import com.laptrinhweb.laptrinhweb.dto.response.IntrospectResponse;
import com.laptrinhweb.laptrinhweb.entity.UserEntity;
import com.laptrinhweb.laptrinhweb.repository.InvalidTokenRepository;
import com.laptrinhweb.laptrinhweb.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenService {
    @Autowired
    private final UserRepository userRepository;
    private final InvalidTokenRepository invalidTokenRepository;

    @Value("${jwt.signerKey}")
    protected String signerKey;


    public IntrospectResponse introspect(IntrospectRequest request)
            throws JOSEException, ParseException {

        var token = request.getToken();
        boolean isValid = true ;
        try {
            verifyToken(token);

        }catch (ParseException e){
            isValid = false;
        }

        return IntrospectResponse.builder()
                .valid(isValid)
                .build();
    }


    public String generateToken(UserEntity user) {

        JWSHeader header =new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUserName())
                .issuer("laptrinhweb.com")
                .issueTime(new Date())
                .expirationTime(new java.util.Date(
                        Instant.now().plus(1 , ChronoUnit.HOURS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildingScope(user))
                .build();

        Payload payload =new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);
        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return jwsObject.serialize();
        }catch (JOSEException e){
            throw new RuntimeException(e);
        }
    }

    private String buildingScope(UserEntity user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles())){
            user.getRoles().forEach(role -> stringJoiner.add("ROLE_" +role.getName()));
        }
        return stringJoiner.toString();
    }

    public SignedJWT verifyToken(String token) throws JOSEException ,ParseException{

        JWSVerifier verifier = new MACVerifier(signerKey.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        var verified = signedJWT.verify(verifier);

        Date expiration = signedJWT.getJWTClaimsSet().getExpirationTime();

        if(!(verified && expiration.after(new Date()))) {
            throw new RuntimeException("Invalid token");
        }
        if(invalidTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new RuntimeException("Invalid token");


        return signedJWT;
    }

}
