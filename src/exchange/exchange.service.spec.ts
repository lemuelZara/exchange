import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CurrenciesService, ExchangeService } from './exchange.service';

describe('ExchangeService', () => {
  const USD = 1;
  const BRL = 0.2;

  let service: ExchangeService;
  let currenciesService: CurrenciesService;

  const mockGetCurrencyUSDtoUSD = () => {
    (currenciesService.getCurrency as jest.Mock).mockReturnValueOnce({
      value: USD,
    });
    (currenciesService.getCurrency as jest.Mock).mockReturnValueOnce({
      value: USD,
    });
  };

  const mockGetCurrencyUSDtoBRL = () => {
    (currenciesService.getCurrency as jest.Mock).mockReturnValueOnce({
      value: USD,
    });
    (currenciesService.getCurrency as jest.Mock).mockReturnValueOnce({
      value: BRL,
    });
  };

  const mockGetCurrencyBRLtoUSD = () => {
    jest
      .spyOn(currenciesService, 'getCurrency')
      .mockResolvedValueOnce({ value: BRL });
    jest
      .spyOn(currenciesService, 'getCurrency')
      .mockResolvedValueOnce({ value: USD });
  };

  beforeEach(async () => {
    const mockCurrenciesService = {
      getCurrency: jest.fn().mockReturnValue({ value: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeService,
        {
          provide: CurrenciesService,
          useFactory: () => mockCurrenciesService,
        },
      ],
    }).compile();

    service = module.get<ExchangeService>(ExchangeService);
    currenciesService = module.get<CurrenciesService>(CurrenciesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ConvertAmount', () => {
    it('should be throw if called with invalid params', async () => {
      await expect(
        service.convertAmount({
          from: '',
          to: '',
          amount: 0,
        }),
      ).rejects.toThrow(new BadRequestException());
    });

    it('should be not throw if called with valid params', async () => {
      await expect(
        service.convertAmount({
          from: 'USD',
          to: 'BRL',
          amount: 10,
        }),
      ).resolves.not.toThrow();
    });

    it('should be called getCurrency twice', async () => {
      await service.convertAmount({ from: 'USD', to: 'BRL', amount: 10 });

      await expect(currenciesService.getCurrency).toBeCalledTimes(2);
    });

    it('should be called getCurrency with correct params', async () => {
      await service.convertAmount({ from: 'USD', to: 'BRL', amount: 10 });

      await expect(currenciesService.getCurrency).toBeCalledWith('USD');
      await expect(currenciesService.getCurrency).toHaveBeenLastCalledWith(
        'BRL',
      );
    });

    it('should be throw when getCurrency throw', async () => {
      (currenciesService.getCurrency as jest.Mock).mockRejectedValue(
        new Error(),
      );

      await expect(
        service.convertAmount({ from: 'INVALID', to: 'BRL', amount: 10 }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });

    it('should be return correct conversion value', async () => {
      mockGetCurrencyUSDtoUSD();

      expect(
        await service.convertAmount({ from: 'USD', to: 'USD', amount: 10 }),
      ).toEqual({ amount: 10 });

      mockGetCurrencyUSDtoBRL();

      expect(
        await service.convertAmount({ from: 'USD', to: 'BRL', amount: 10 }),
      ).toEqual({ amount: 50 });

      mockGetCurrencyBRLtoUSD();

      expect(
        await service.convertAmount({ from: 'BRL', to: 'USD', amount: 10 }),
      ).toEqual({ amount: 2 });
    });
  });
});
