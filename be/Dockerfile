# ==========================================
# STAGE 1: Build Spring Boot JAR từ mã nguồn
# ==========================================
FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder
WORKDIR /build

COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==========================================
# STAGE 2: Môi trường chạy tối giản JRE 21
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Tạo tài khoản bảo mật non-root
RUN addgroup -S heritage && adduser -S heritage -G heritage

COPY --from=builder /build/target/*.jar app.jar
RUN chown -R heritage:heritage /app

USER heritage
EXPOSE 8080

ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -Dfile.encoding=UTF-8"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
