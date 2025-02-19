package com.hexa.muinus.store.service;

import com.hexa.muinus.users.dto.ReceiveCouponRequestDto;
import jakarta.persistence.OptimisticLockException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponFacade {
    private final CouponService couponService;

    public void receiveCouponWithRetry(HttpServletRequest request, ReceiveCouponRequestDto receiveCouponRequestDto){
        int maxAttempts = 5;
        int attempt = 0;

        while(attempt < maxAttempts){
            try {
                // 여기서 트랜잭션 메소드를 한 번 호출
                couponService.receiveCoupon(request, receiveCouponRequestDto);
                // 성공하면 그냥 종료
                return;
            } catch (OptimisticLockException | ObjectOptimisticLockingFailureException e){
                attempt++;
                log.warn("낙관적 락 충돌 발생 - 재시도 {}/{}", attempt, maxAttempts);

                // 재시도 횟수 초과 시 실패
                if (attempt >= maxAttempts) {
                    log.error("최대 재시도 횟수 초과 - 쿠폰 수령 실패");
                    throw new RuntimeException("쿠폰 수령 중 (낙관적)충돌이 발생했습니다. 다시 시도해주세요");
                }

                // 짧게 대기 후 재시도
                try {
                    Thread.sleep(new Random().nextInt(100) + 1);
                } catch (InterruptedException ignored) {
                }
            } catch (CannotAcquireLockException e){
                attempt++;
                log.warn("데드락 충돌 발생 - 재시도 {}/{}", attempt, maxAttempts);

                // 재시도 횟수 초과 시 실패
                if (attempt >= maxAttempts) {
                    log.error("최대 재시도 횟수 초과 - 쿠폰 수령 실패");
                    throw new RuntimeException("쿠폰 수령 중 (데드락)충돌이 발생했습니다. 다시 시도해주세요");
                }

                // 짧게 대기 후 재시도
                try {
                    Thread.sleep(new Random().nextInt(100) + 1);
                } catch (InterruptedException ignored) {
                }
            }
        }

        // 이 로직에 도달할 일은 없겠으나, 혹시 모를 경우를 대비
        throw new RuntimeException("예상치 못한 쿠폰 수령 실패");
    }
}
